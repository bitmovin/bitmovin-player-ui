#!/bin/bash
set -e

PACKAGE_NAME="bitmovin-player-ui"
CI_BRANCH=$TRAVIS_BRANCH

echo "INFO branch is set to ${CI_BRANCH}"

CHANNEL=-1
NPM_TAG=-1
MAJOR=-1
MINOR=-1
POSTIFX=-1
VERSION=-1

NPM_DRY_RUN_CMD=""
if [[ $NPM_DRY_RUN = true ]]; then
    NPM_DRY_RUN_CMD="--dry-run"
    echo "INFO performing a dry run"
fi

if [[ "${CI_BRANCH}" =~ ^v([0-9]+)\.([0-9]+)\.([0-9]+)-?([a-z]*) ]]; then
    MAJOR=${BASH_REMATCH[1]}
    MINOR=${BASH_REMATCH[2]}
    HOTFIX=${BASH_REMATCH[3]}
    POSTFIX=${BASH_REMATCH[4]}
    VERSION=${CI_BRANCH:1}
    case ${POSTFIX} in
        "b")
            CHANNEL="beta"
            NPM_TAG="beta"
            ;;
        "rc")
            CHANNEL="staging"
            NPM_TAG="staging"
            ;;
        "")
            CHANNEL="stable"
            NPM_TAG="latest"
            ;;
        *)
            echo "ERROR postfix ${POSTFIX} not supported"
            exit 1
            ;;
    esac
else
    echo "INFO ${CI_BRANCH} is not a valid version to be published, skipping"
    exit 0
fi

echo "INFO npm tag set to ${NPM_TAG}"
if [[ ${NPM_TAG}  == -1 ]]; then
    echo "ERROR npm tag ${NPM_TAG} not valid"
    exit 1
fi

## Check if this version was already published.
## If something went wrong during a later build step and we re-run the release
## after fixing the problem, the npm publish would fail the build.
IS_PUBLISHED=$(npm view ${PACKAGE_NAME}@${VERSION} dist-tags)

if [[ ${IS_PUBLISHED} ]]; then
    echo "WARNING ${VERSION} is already published, skipping."
    exit 0
else
    echo "INFO ${VERSION} not published yet, publishing now"
fi

echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" > ~/.npmrc
chmod 0600 ~/.npmrc

NPM_LATEST=$(npm view --json ${PACKAGE_NAME} dist-tags | jq -r ".${NPM_TAG}")
echo "INFO latest npm version is $NPM_LATEST"

# We always publish the package with the channel/latest tag because there is no way to publish a package without
# a tag (the default tag is always "latest"). If the published version is older that the currently tagged version,
# we have to revert the tag afterwards to avoid version regressions.
echo "INFO publishing ${VERSION} to npm with tag "${NPM_TAG}" (current tagged version is ${NPM_LATEST})"
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

if version_gt ${NPM_LATEST} ${VERSION}; then
    # The version we just published is lower than the previously tagged version on npm, so we need to revert the
    # tag to the previous version to avoid version downgrades (this e.g. avoids that a 7.2.5 hotfix release overwrites
    # the latest-tagged 7.3.2)
    echo "INFO reverting "${NPM_TAG}" tag from the just published version ${VERSION} to the greater ${NPM_LATEST}"
    # It takes a while until the metadata after npm publish is updated so we need to wait to avoid a failed tag update
    # "npm WARN dist-tag add latest is already set to version ${VERSION}"
    if [[ $NPM_DRY_RUN != true ]]; then
        sleep 10
        npm dist-tag add ${PACKAGE_NAME}@${NPM_LATEST} ${NPM_TAG}
    fi
fi
