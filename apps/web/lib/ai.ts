import OpenAI from "openai";

export const openai = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: "AIzaSyCmVlGTc4-cu1HlMMTfWYoCtKzHCLyHgSE",
  dangerouslyAllowBrowser: true
})
