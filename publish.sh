#!/usr/bin/env bash

set -e
set -o pipefail

[ "$DEBUG" = 1 ] && set -x

show_usage() {
  cat <<EOF
  Usage: $(basename "$0") --version "Version Number" [options]

  This script publishes the UI to npm.js using the provided Version Number

  Options:
    --version "SDK_VERSION"           The Version Number for the release (required).
    --dry-run                         Executes a dry run NPM publish without actually
                                      publishing the package.

    -h, --help                        Display this help message.

  Examples:
    $(basename "$0") --version "3.71.0"
    $(basename "$0") --version "3.71.0-beta.3" --dry-run
EOF
}

show_error() {
  cat <<EOF
❌ Error: $1

==================================

$(show_usage)
EOF
}

PACKAGE_NAME="bitmovin-player-ui"
NPM_TAG=-1
NPM_DRY_RUN=
VERSION_NUMBER=
NPM_DRY_RUN_CMD=""

while test $# -gt 0; do
    case "$1" in
        --dry-run)
            NPM_DRY_RUN=1
            shift
            ;;
        --version)
            if [[ -z "$2" || "$2" =~ ^- ]]; then
                show_error "--version requires an argument!"
                exit 1
            fi
            VERSION_NUMBER="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            show_error "'$1' is not a recognized option!"
            exit 1
            ;;
    esac
done

if [ -z "$VERSION_NUMBER" ]; then
  show_error "Please provide a version number using --version."
  exit 1
fi

if [[ $NPM_DRY_RUN = 1 ]]; then
    NPM_DRY_RUN_CMD="--dry-run"
    echo "INFO performing a dry run"
fi

if [[ "${VERSION_NUMBER}" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)(-(alpha|beta|rc)\.([0-9]+))?$ ]]; then
    PRE_RELEASE_TAG=${BASH_REMATCH[5]}
    case ${PRE_RELEASE_TAG} in
        "alpha")
            NPM_TAG="alpha"
            ;;
        "beta")
            NPM_TAG="beta"
            ;;
        "rc")
            NPM_TAG="staging"
            ;;
        "")
            NPM_TAG="latest"
            ;;
        *)
            echo "ERROR postfix ${PRE_RELEASE_TAG} not supported"
            exit 1
            ;;
    esac
else
    echo "INFO ${VERSION_NUMBER} is not a valid version to be published, skipping"
    exit 1
fi

echo "INFO npm tag set to ${NPM_TAG}"
if [[ ${NPM_TAG} == -1 ]]; then
    echo "ERROR npm tag ${NPM_TAG} not valid"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "npm version: ${NPM_VERSION}"

# In more recent npm versions, the below command fails, and fails this whole
# script due to `set -e` at the top of the file. To gracefully handle this
# change, we're disabling bash's abort on error setting temporarily, for this
# command.
set +e
# Check if this version was already published.
# If something went wrong during a later build step and we re-run the release
# after fixing the problem, the npm publish would fail the build.
IS_PUBLISHED=$(npm view "${PACKAGE_NAME}@${VERSION_NUMBER}" dist-tags)
set -e

if [[ ${IS_PUBLISHED} ]]; then
    echo "WARNING ${VERSION_NUMBER} is already published, skipping."
    exit 1
else
    echo "INFO ${VERSION_NUMBER} not published yet, publishing now"
fi

echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" > ~/.npmrc
chmod 0600 ~/.npmrc

NPM_LATEST=$(npm view --json ${PACKAGE_NAME} dist-tags | jq -r ".${NPM_TAG}")
echo "INFO latest npm version is $NPM_LATEST"

# We always publish the package with the channel/latest tag because there is no way to publish a package without
# a tag (the default tag is always "latest"). If the published version is older that the currently tagged version,
# we have to revert the tag afterwards to avoid version regressions.
echo "INFO publishing ${VERSION_NUMBER} to npm with tag '${NPM_TAG}' (current tagged version is ${NPM_LATEST})"
npm publish --tag ${NPM_TAG} ${NPM_DRY_RUN_CMD}

# Checks if one version is greater than the other
# https://stackoverflow.com/a/24067243/370252
# Edge cases:
#  - if version_gt "7.3.2" "7.3.2" evaluates to false
#    so this can't be used to overwrite an existing version
#  - if version_gt "7.3.2" "7.3.2-0" evaluates to false
#    prerelease versions are considered greater than the final release,
#    but since we're splitting the versions into channels that is not important right now
#    (as a workaround we could suffix "-zzzzz" to versions without a suffix)
function version_gt() { test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"; }

if version_gt "$NPM_LATEST" "$VERSION_NUMBER"; then
    # The version we just published is lower than the previously tagged version on npm, so we need to revert the
    # tag to the previous version to avoid version downgrades (this e.g. avoids that a 7.2.5 hotfix release overwrites
    # the latest-tagged 7.3.2)
    echo "INFO reverting '${NPM_TAG}' tag from the just published version ${VERSION_NUMBER} to the greater ${NPM_LATEST}"
    # It takes a while until the metadata after npm publish is updated so we need to wait to avoid a failed tag update
    # "npm WARN dist-tag add latest is already set to version ${VERSION_NUMBER}"
    if [[ $NPM_DRY_RUN != 1 ]]; then
        sleep 10
        npm dist-tag add ${PACKAGE_NAME}@${NPM_LATEST} ${NPM_TAG}
    fi
fi
