function detectMobile() {
   if (navigator.userAgent.toLowerCase().match(/mobile/i)) {
      return true
   } else return false
}

module.exports = {
   detectMobile
}