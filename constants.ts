import { DigitalProduct } from './types';

export const PRODUCTS: DigitalProduct[] = [
  { 
    id: '1', 
    name: 'THE OMNI PROTOCOL', 
    price: 149, 
    description: 'A holistic framework for multi-agent orchestration and low-latency infrastructure.', 
    category: 'SYSTEMS', 
    image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800', 
    fileUrl: 'architech_omni_protocol_v1.zip' 
  },
  { 
    id: '2', 
    name: 'STRATEGIC ALIGNMENT', 
    price: 89, 
    description: 'Advanced prompt libraries and reasoning chains for proprietary intelligence.', 
    category: 'ASSETS', 
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=800', 
    fileUrl: 'strategic_alignment_v2.zip' 
  },
  { 
    id: '3', 
    name: 'THE AGENTIC STACK', 
    price: 199, 
    description: 'Masterclass: Deployment blueprints for autonomous growth loops and automated sales funnels.', 
    category: 'COURSES', 
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800', 
    fileUrl: 'agentic_stack_v1.zip' 
  },
];
