import GraphCall from "../service/graph.service.js"
import { Request,Response } from "express";

export const invoke = async (req:Request, res:Response) => {
  const { message } = req.body;

  try {
    const { message } = req.body;
    // console.log(message);
    if (!message) {
      return res.status(400).json({
        message: "Missing message parameter",
      });
    }

    const result = await GraphCall(message);

    res.status(201).json({
      message: "graph executed successfully",
      success: true,
      result,
    });
  } catch (error) {
    res.json({
      message: "something went wrong",
      error: error,
    });
  }
};
