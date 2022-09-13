/*
  RequestHelpMenu Command
  Type: CHAT_INPUT
*/

module.exports = {
  "discordSlashMetadata": {
    "name": "requestHelpMenu",
    "type": 1, 
    "description": "Request items in Hay Day",
    "options": [
      {
        "name": "Request Type",
        "description": "The type of request you are making.",
        "type": 3,
        "required": true,
        "choices": [
          {
            "label": "Rares",
            "value": "rares",
            "description": "Things like barn, silo, land, and town upgrade items."
          }, 
          {
              "label": "Crops and Products",
              "value": "products",
              "description": "Need some wheat?  Maybe a few blankets?"
          },
          {
              "label": "Help Tasks",
              "value": "helptask",
              "description": "YOU are requesting someone to put up help tasks."
          },
          {
              "label": "Other",
              "value": "other",
              "description": "Anything else not listed."
          }
        ]
      },
      {
        "name": "Short Message",
        "description": "Tell us a bit about what you are requesting.  Try to be descriptive, but brief.",
        "type": 3,
        "required": true
      }
    ]
  },

  execute(requestJSON) {
    let responseJson = {
      "type": 9,
      "data": { 
        "custom_id": "requestHelpMessage",
        "title": "Tell us about your request",
        "components": [
          {
            "type": 1,
            "components": [{
              "type": 4,
              "custom_id": "requestHelp",
              "style": 2,
              "label": "Try to be descriptive, but brief.",
              "required": true,
              "placeholder": "I'm a placeholder"
            }]
        }]
        
      }
    };

    if (requestJSON.data.values.length === 1) {
      const requestChoice = requestJSON.data.values[0];

      responseJson.data.components[0].components[0].custom_id += "_" + requestChoice;
      let placeholder = "I'm a placeholder";

      switch (requestChoice) {
        case "rares":
          placeholder = "I am looking for planks and will trade nails."
          break;
      
        case "products":
          placeholder = "I need potatos for my boat."
          break;
        
        case "helptask":
          placeholder = "I need some trees and bushes for my help task."
          break;
        
        case "other":
          placeholder = "My truck broke down in the valley."
          break;

        default:
          break;
      }

      responseJson.data.components[0].components[0].placeholder = placeholder;
    }

    return responseJson;
  },
};