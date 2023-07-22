const fs = require('fs-extra')

const sg = async (config = Object) => {
   
    const declareValidType = (type) => {
        let moduleNames = config.modules.map(mdl =>mdl.name)
        switch(type){
            case 'String':
                return 'string'
            case 'Number':
                return 'integer'
            case 'Boolean':
                return 'boolean'
            case 'Date':
                return 'string'        
            case moduleNames.find(itm =>itm == type):
                return 'string'
            
            default:
                return type    
        }
    }
    let template =
`
{
    "swagger": "2.0",
    "info": {
        "title": "${config.name} API Document",
        "description": "",
        "termsOfService":  "https://www.google.com/policies/terms/",
        "contact": {
            "email": "contact@snippets.local"
          },
          "license": {
            "name": "BSD License"
          },
          "version": "v1"
        },
        "host": "localhost:${config.apiPort}",
    "schemes": [
        "${config.https ? 'https' : "http"}"
      ],
      "basePath": "/api",
      "consumes": [
        "application/json"
      ],
      "produces": [
        "application/json"
      ],
      "securityDefinitions": {
        "api_key": {
          "type": "apiKey",
          "in": "header",
          "name": "Authorization"
        }
      },
      "security": [
        {
          "api_key": [ ]
        }
      ],
      "paths": {
        ${
            config.modules.map(mdl => {
                return `
                "/${mdl.name}": {
                    "get": {
                        "operationId": "${mdl.name}_get_list",
                        "description": "${mdl.name} get list",
                        "parameters": [${
                            Object.keys(mdl.model).map(item => {
                                return `{
                                    "name": "${item}",
                                    "in":"query",
                                    "description": "",
                                    "required": false,
                                    "type": "string"
                                }
                                `
                            })
                        }],
                        "responses":{
                            "200": {
                                "description": "",
                                "schema": {
                                    "requried": [
                                        "count",
                                        "result"
                                    ]
                                },
                                "type": "object",
                                "properties": {
                                    "count": {
                                        "type": "integer"
                                    },
                                    "results": {
                                        "type": "array",
                                        "items": {
                                          "$ref": "#/definitions/${mdl.name}"
                                        }
                            
                                }
                            }
                        }
                    },
                    "tags": [
                        "${mdl.name}"
                    ]
                   
                    },
                    "post": {
                        "operationId": "${mdl.name}_create",
                        "description": "",
                        "parameters": [
                          {
                            "name": "data",
                            "in": "body",
                            "required": true,
                            "schema": {
                              "$ref": "#/definitions/${mdl.name}"
                            }
                          }
                        ],
                        "responses": {
                          "200": {
                            "description": "",
                            "schema": {
                              "$ref": "#/definitions/${mdl.name}"
                            }
                          },
                          "201": {
                            "description": "",
                            "schema": {
                              "$ref": "#/definitions/${mdl.name}"
                            }
                          }
                        },
                        "tags": [
                          "${mdl.name}"
                        ]
                      },
                      "parameters": [ ]
                },
                "/${mdl.name}/{id}": {
                    "get": {
                        "operationId": "${mdl.name}_get_detail",
                        "description": "",
                        "parameters": [ ],
                        "responses": {
                          "200": {
                            "description": "",
                            "schema": {
                              "$ref": "#/definitions/${mdl.name}"
                            }
                          }
                        },
                        "tags": [
                          "${mdl.name}"
                        ]
                      },
                      "put": {
                        "operationId": "${mdl.name}_update",
                        "description": "",
                        "parameters": [
                          {
                            "name": "data",
                            "in": "body",
                            "required": true,
                            "schema": {
                              "$ref": "#/definitions/${mdl.name}"
                            }
                          }
                        ],
                        "responses": {
                          "200": {
                            "description": "",
                            "schema": {
                              "$ref": "#/definitions/${mdl.name}"
                            }
                          }
                        },
                        "tags": [
                          "${mdl.name}"
                        ]
                      },
                      "delete": {
                        "operationId": "${mdl.name}_delete",
                        "description": "",
                        "parameters": [ ],
                        "responses": {
                          "204": {
                            "description": ""
                          }
                        },
                        "tags": [
                          "${mdl.name}"
                        ]
                      },
                      "parameters": [
                        {
                          "name": "id",
                          "in": "path",
                          "description": "A unique integer value identifying this ${mdl.name}",
                          "required": true,
                          "type": "string"
                        }
                    ]
                }
                `
            })
        }
      },
      "definitions": {
        ${
            config.modules.map(mdl => {
                return `
                "${mdl.name}":{
                    "required": [],
                    "type": "object",
                    "properties": {
                        "_id": {
                            "title": "ID",
                            "type": "string",
                            "readOnly": true
                        },
                        ${
                            Object.keys(mdl.model).map(item => {
                                return `
                                "${item}": {
                                    "title": "${item}",
                                    "type": "${declareValidType(mdl.model[item]?.type ? mdl.model[item]?.type : mdl.model[item])}",
                                    ${(mdl.model[item]?.type == "Date" || mdl.model[item] == "Date")  ? '"format": "date-time",' : ''}
                                    "minLength": 1
                                }
                                `
                            })
                        }
                        ${typeof config.baseModel == 'object' ? ',' : ''}
                        ${ typeof config.baseModel == 'object' ?
                            Object.keys(config.baseModel).map(item => {
                                return `
                                "${item}": {
                                    "title": "${item}",
                                    "type": "${declareValidType(config.baseModel[item]?.type ? config.baseModel[item]?.type : config.baseModel[item])}",
                                    ${(config.baseModel[item]?.type == "Date" || config.baseModel[item] == "Date")  ? '"format": "date-time",' : ''}
                                    "minLength": 1
                                }
                                `
                            })
                        : ''}
                    }
                }
                `
            })
        }
      }
}
`

fs.writeFileSync(`backend/src/swagger.json`,template)
console.log(`🟥 Selph - Swagger Documentation generated...`)
}

module.exports = sg