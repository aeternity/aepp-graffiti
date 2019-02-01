import Vue from 'vue'
import bugsnag from '@bugsnag/js'
import bugsnagVue from '@bugsnag/plugin-vue'
import secret from '@/secret'

const bugsnagClient = bugsnag(secret.bugsnagSecret).use(bugsnagVue, Vue)

export default bugsnagClient
