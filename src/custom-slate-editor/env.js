import _ from 'lodash'

var env = {}

export function setEnv(newEnv) {
  _.assign(env, newEnv)
}

export default env
