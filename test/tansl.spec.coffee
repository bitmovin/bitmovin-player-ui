chai = require 'chai'
should = chai.should()
assert = chai.assert
path = require 'path'

Translation = require '../src/ts/i18n.ts'
# process.env.DEBUG = 'bt-player-ui:*'

swallowConsoleWarnings = false

try
	describe 'Translation tests: ', ->

		i18n = {}
		beforeEach ->
			i18n = new Translation.I18n()

		# Error and warning isolation
		if swallowConsoleWarnings
			console.warn = ->
			console.error = ->


		it 'Default should be english', ->

			i18n.q.language.should.eql 'english'

		it 'Should provide basic english translation for nested keys ', ->

			i18n.q.settings.panel.audioQuality.should.eql 'Audio Quality'

		it 'It should be possible to override ', ->

			i18n.addTranslation language: 'pirate-english'
			i18n.q.language.should.eql 'pirate-english'

		it 'It should be possible to override in a nested scenario', ->

			i18n.addTranslation
				language: 'pirate-english'
				settings: panel: audioQuality: 'Audio Qualitarrr'

			i18n.q.language.should.eql 'pirate-english'
			i18n.q.settings.panel.audioQuality.should.eql 'Audio Qualitarrr'

		it 'It should provide english if provided language is missing', ->

			i18n.addTranslation
				language: 'pirate-english'
				settings: panel: audioQuality: 'Audio Qualitarrr'

			i18n.q.language.should.eql 'pirate-english'
			i18n.q.settings.panel.audioQuality.should.eql 'Audio Qualitarrr'
			i18n.q.settings.panel.videoQuality.should.eql 'Video Quality'


		it 'Functional render should be supported for en', ->

			i18n.q.messages.connectingTo('test').should.eql 'Connecting to <strong>test</strong>...'

		it 'Functional render should be supported for user-provided string', ->

			i18n.addTranslation
				language: 'pirate-english'
				messages: connectingTo: (l) -> ">>#{l}<<"

			i18n.q.messages.connectingTo('test').should.eql '>>test<<'


		it 'Functional render should should fallback to default', ->
			i18n.addTranslation
				language: 'pirate-english'
				messages: remainingTime: 'Ad: {remainingTime} secs'


			i18n.q.messages.connectingTo('test').should.eql 'Connecting to <strong>test</strong>...'
			i18n.q.messages.remainingTime.should.eql 'Ad: {remainingTime} secs'


		describe 'Built in locale (`en` and `de`) tests:', ->

			it 'It should be possible to set a built in locale', ->

				i18n.q.language.should.eql 'english'
				i18n.setLocale 'de'
				i18n.q.language.should.eql 'german'


			it 'It should not be possible to set a non existent locale', ->

				i18n.q.language.should.eql 'english'
				i18n.setLocale 'zz'
				i18n.q.language.should.eql 'english'

		it.skip 'test', ->


	describe 'Isolation tests', ->

		it 'Two instances should not overlap', ->
			a = new Translation.I18n()
			b = new Translation.I18n()

			a.q.language.should.eql 'english'
			b.q.language.should.eql 'english'

			a.q.language = 'test1'
			a.q.language.should.eql 'test1'
			b.q.language.should.eql 'english'

			b.q.language = 'test2'
			a.q.language.should.eql 'test1'
			b.q.language.should.eql 'test2'

		it 'singleton and an instance should not have any collisions', ->

			a = new Translation.I18n()

			a.q.language.should.eql 'english'
			a.q.language = 'test1'

			a.q.language.should.eql 'test1'
			Translation.default.q.language.should.eql 'english'



	describe 'Test default translation singleton', ->

		i18n = Translation.default

		it 'Default english test', ->

			i18n.q.language.should.eql 'english'
			i18n.q.settings.panel.audioQuality.should.eql 'Audio Quality'

		it 'Add custom extension', ->

			i18n.addTranslation
				language: 'pirate-english'
				settings: panel: audioQuality: 'Audio Qualitarrr'

			i18n.q.language.should.eql 'pirate-english'
			i18n.q.settings.panel.audioQuality.should.eql 'Audio Qualitarrr'

		it 'should default back to english if translation is not found', ->
			i18n.q.settings.panel.videoQuality.should.eql 'Video Quality'

		it.skip 'should provide a label as a string if not found in a user or en locale', ->
			# might require some reflection API.
			i18n.q.settings.bottleOfRum.should.eql 'settings.bottleOfRum'

# Catch for any unhandled promise in the code
catch e
	console.log '>> ', e
