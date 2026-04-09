import { Response } from 'express';


export const initializeSSE = (res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Necessary for embed widget
  res.flushHeaders();
};


export const sendSSEEvent = (res: Response, data: any) => {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};
