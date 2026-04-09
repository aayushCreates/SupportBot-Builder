import { Request, Response } from 'express';
import { Webhook } from 'svix';
import prisma from '../config/db';

export const clerkWebhookHandler = async (req: Request, res: Response) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // Get the headers
  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  // Get the body
  const payload = req.body;
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with ID ${id} and type ${eventType}`);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id: clerkId, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = first_name ? `${first_name} ${last_name || ''}`.trim() : null;

    await prisma.user.upsert({
      where: { clerkId },
      create: {
        clerkId,
        email,
        name,
      },
      update: {
        email,
        name,
      },
    });
  }

  if (eventType === 'user.deleted') {
    const { id: clerkId } = evt.data;
    await prisma.user.delete({
      where: { clerkId },
    }).catch((err: any) => console.error('Error deleting user:', err));
  }

  res.status(200).json({ success: true });
};
