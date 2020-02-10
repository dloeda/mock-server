/*globals req, params, query, mock*/
mock = {
  '@mock': {
    'status': '203',
    'content' : {
      'id': Math.floor(Math.random()*1000),
      'params': params
    }
  }
}

if (query) {
  if (query.name && query.surname)
    mock['@mock'].content.fullname = `${query.name} ${query.surname}`;
}

