/*globals req, params, query, mock*/
mock = {
  "@mock": {
    "status": "503",
    "content" : {
      "id": Math.floor(Math.random()*1000)
    }
  }
}

if (query) {
  if (query.name && query.surname)
    mock['@mock'].content.fullname = query.name + ' ' + query.surname
}
 
