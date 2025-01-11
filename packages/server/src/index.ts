import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { addressToId, constructMessages, recoverAddress } from './utils';
import { MESSAGE } from './constants';
import { getWorldPrompts } from './cms';

import { getComponentValueStrict } from "@latticexyz/recs";
import { setup } from "./mud/setup";

dotenv.config();

const PRIVATE_API_KEY = process.env.PRIVATE_ANTHROPIC_API_KEY as string;
const PRIVATE_ETH_KEY = process.env.PRIVATE_ETH_KEY as string;
const CHAIN_ID = Number(process.env.CHAIN_ID) as number;

const app = express();
const port = 3131;

// Enable CORS
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

const {
    components,
    systemCalls: { reward, punish },
    network,
  } = await setup(PRIVATE_ETH_KEY, CHAIN_ID);

// Route to handle OpenAI API requests
app.post('/api/generate', async (req, res) => {
    try {
        const {
            signature,
            roomId,
            ratId,
        } = req.body;

        console.log('signature', signature);
        console.log('roomId', roomId);
        console.log('ratId', ratId);

        const worldPrompts = await getWorldPrompts();
        console.log('worldPrompts', worldPrompts);
        const systemPrompt = `${worldPrompts.realityPrompt} ${worldPrompts.stylePrompt} ${worldPrompts.formatPrompt}`;

        // TODO: Get signed message from sender
        // TODO: Verify the signature
        const sender = addressToId(recoverAddress(signature, MESSAGE));

        console.log('sender', sender);

        const roomEntity = network.world.registerEntity({ id: roomId})
        const ratEntity = network.world.registerEntity({ id: ratId})

        const { RoomPrompt, Trait, Owner } = components

        // TODO: Verfiy that rat is owned by the sender
        const ratOwner = getComponentValueStrict(Owner, ratEntity)?.value ?? ""
        console.log('ratOwner', ratOwner);
        if (ratOwner !== sender) {
            return res.status(403).json({ error: 'You are not the owner of the rat.' });
        }

        const roomPrompt = getComponentValueStrict(RoomPrompt, roomEntity)?.value ?? ""
        const ratPrompt = getComponentValueStrict(Trait, ratEntity)?.value ?? ""

        console.log('roomPrompt', roomPrompt);
        console.log('ratPrompt', ratPrompt);

        const messages = constructMessages(
            roomPrompt,
            ratPrompt
        );

        // Adjust messages to match the expected type
        const formattedMessages = messages.map(msg => {
            const formattedMessage: any = { role: msg.role, content: msg.content };
            if (msg.role === 'function') {
                formattedMessage.name = msg.name;
            }
            return formattedMessage;
        });

        const anthropic = new Anthropic({
            apiKey: PRIVATE_API_KEY
        });

        const msg = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            messages: formattedMessages,
            system: systemPrompt
        });

        // Access the text property
        const rawText = msg.content[0].text;

        // Parse the text into a native object
        let outcome;
        try {
            outcome = JSON.parse(rawText);
            console.log(outcome);
        } catch (error) {
            console.error("Failed to parse JSON:", error);
            return res.status(403).json({ error: 'Error: Failed to parse JSON' });
        }

        if(outcome.success) {
            reward(ratId);
        } else {
            punish(ratId);
        }

        res.json(outcome);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
