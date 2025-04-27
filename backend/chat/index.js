import { GoogleGenAI } from "@google/genai";
import { Item } from "../db/schema/schema.js";

const ai = new GoogleGenAI({ apiKey: "AIzaSyAIW1W9GpjjQ_7WfIi1wkC0O3nh83kOAZY"});

async function AllItems(){
    const responseString = await Item.find({});
    const finalString = JSON.stringify(responseString);
    console.log(finalString);
    return finalString;
}

async function Wharry (Question) {  
  const all_items = await AllItems();
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: Question,
    config : {

        // implement the logic for reading and writing on the csv file.

        systemInstruction : `
        You are a helpful AI assistant that helps users find information in warehouse inventory data. 
        The data will be provided as a string containing an array of MongoDB-style objects.
        Each object represents an inventory item with properties like:
        - id
        - name 
        - category
        - location
        - volume
        - priority
        - lastAccessed
        - expirationDate
        - movable
        - fragility

        When asked questions, analyze the data and provide clear, natural language responses about:
        - Where specific items are located
        - What items are in specific locations
        - Details about item properties
        - Inventory status and availability
        
        The data will be provided after this instruction. Parse it and respond to queries naturally.
        
        For example, if asked "Where are the food rations?", respond with the specific location like:
        "The food rations are located in Bay A, Section 1"

        Always be precise with locations and details from the data.
        If information is not found, politely indicate that.
        Format responses in clear, complete sentences.

        the provided data string : 
        ${all_items}
        `
    }
    
});
  console.log(response.text);

  return response.text;
}


export {
    Wharry
};