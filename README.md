# mock-js-server
> A mock server that allow to generate responses by JSONs or JSs files

## Configure it
The first step is to configure ``config/routes.json``, where we will map our API endpoint routes to JSON/JS files.

```json
{
  "^$": "../config/info.json",
  ".*user.*": "user/default.js"
}
```

## Mock files
There're multiple options to return a response via this server:

### JSON file
This wil return JSON response at it's defined in the JSON file.

```json
{
  "status": "OK"
}
```
### Execute JS file
```javascript
/*globals req, params, query, mock*/
mock = {
  'id': Math.floor(Math.random()*1000)
}

if (query) {
  if (query.name && query.surname)
    mock.fullname = `${query.name} ${query.surname}`;
}
```

### Mock Object
You must use the ``@mock`` key to add contenType or statusCodel ike this:
```json
{
    "@mock": {
        "status": 404,
        "contentType": "text/html",
        "content": "<html><head><title>404</title></head><body>You hit a 404</body></html>"
    }
}
```

Also you can add a download action to the mock:
```json
{
    "@mock": {
        "status": 200,
        "@download": "./LICENSE"
    }
}
```


### Run it
Just run `npm start` to run it simple or configure as tu want with these options:

| Option  | Key | Default |  Description |
| ------------- | ------------- | ------------- | ------------- |
| Config file | `-c` | `config.json` | Name of configuration file |
| Config Folder | `--config-folder` | `./config/` | Path of configuration\'s folder |
| Routes File | `--routes-file` | `routes.json` |Name of the routes file |
| Mock Folder | `--mocks-folder` | `./mocks/` |Path of the mock folder |
| Port | `-p` | None | Listening port |
| Delay | `-d` | None | Delay in ms |