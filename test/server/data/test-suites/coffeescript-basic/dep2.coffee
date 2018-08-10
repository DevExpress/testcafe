import dep1Fn from './dep1'

export default ->
    "#{await dep1Fn()} and dep2"
