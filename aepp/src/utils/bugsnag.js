import Vue from 'vue'
import bugsnag from '@bugsnag/js'
import bugsnagVue from '@bugsnag/plugin-vue'
import secret from '@/secret'

const bugsnagClient = bugsnag({
  apiKey: secret.bugsnagSecret,
  appVersion: '1.0.0'
}).use(bugsnagVue, Vue)

export default bugsnagClient
