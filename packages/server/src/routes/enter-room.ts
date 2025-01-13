import Anthropic from '@anthropic-ai/sdk';
import { addressToId, constructMessages, recoverAddress } from '../utils';
import { MESSAGE } from '../constants';
import { getWorldPrompts } from '../cms';

import { getComponentValueStrict } from "@latticexyz/recs";
import { setup } from "../mud/setup";

import dotenv from 'dotenv';
import type { FastifyInstance, FastifyRequest } from 'fastify';

dotenv.config();

const PRIVATE_API_KEY = process.env.PRIVATE_ANTHROPIC_API_KEY as string;
const PRIVATE_ETH_KEY = process.env.PRIVATE_ETH_KEY as string;
const CHAIN_ID = Number(process.env.CHAIN_ID) as number;

type Outcome = {
    eventLog: string[],
    change: string,
    success: boolean
};

type EnterRoomBody = {
    signature: string;
    roomId: string;
    ratId: string;
}

const {
    components,
    systemCalls: { addTrait },
    network,
  } = await setup(PRIVATE_ETH_KEY, CHAIN_ID);

const opts = {
    schema: {
    body: {
            type: 'object',
            properties: {
                signature: { type: 'string' },
                roomId: { type: 'string' },
                ratId: { type: 'string' }
            }
        },
      response: {
        200: {
          type: 'object',
          properties: {
            eventLog: { type: 'array' },
            change: { type: 'string' },
            success: { type: 'boolean' }
          }
        },
        403: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
        },
        500: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
        }
      }
    }
  }

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes (fastify: FastifyInstance, options: object) {
    fastify.post('/room/enter', opts, async (request: FastifyRequest<{ Body: EnterRoomBody }>, reply) => {
        try {
            const {
                signature,
                roomId,
                ratId,
            } = request.body;
    
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
    
            const roomEntity = network.world.registerEntity({ id: roomId });
            const ratEntity = network.world.registerEntity({ id: ratId });
    
            const { RoomPrompt, Trait, Owner } = components;
    
            // Verify that rat is owned by the sender
            const ratOwner = getComponentValueStrict(Owner, ratEntity)?.value ?? "";
            console.log('ratOwner', ratOwner);
            if (ratOwner !== sender) {
                return reply.status(403).send({ error: 'You are not the owner of the rat.' });
            }
    
            const roomPrompt = getComponentValueStrict(RoomPrompt, roomEntity)?.value ?? "";
            const ratPrompt = getComponentValueStrict(Trait, ratEntity)?.value ?? "";
    
            console.log('roomPrompt', roomPrompt);
            console.log('ratPrompt', ratPrompt);
    
            const messages = constructMessages(
                roomPrompt,
                ratPrompt
            );
    
            // Adjust messages to match the expected type
            const formattedMessages = messages.map(msg => {
                const formattedMessage = { role: msg.role, content: msg.content };
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
            let outcome: Outcome;
            try {
                outcome = JSON.parse(rawText);
                console.log(outcome);
            } catch (error) {
                console.error("Failed to parse JSON:", error);
                return reply.status(403).send({ error: 'Error: Failed to parse JSON' });
            }
    
            if (outcome.change?.length > 0) {
                await addTrait(ratId, outcome.change);
            }
    
            reply.send(outcome);
        } catch (error) {
            console.error('Error:', error);
            reply.status(500).send({ error: 'An error occurred while processing the request.' });
        }
    });
}

export default routes;