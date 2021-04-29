import goods from './goods'

console.log('i am info.js')
goods.log('info.js')

export default {
  log(username) {
    console.log('i am info.js used by the ' + username)
  }
}