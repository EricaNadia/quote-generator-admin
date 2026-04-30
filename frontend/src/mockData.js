// MOCK DATA — used when USE_MOCK = true
   // This file prevents spending Base44 integration credits during development.
   // Switch USE_MOCK to false only when doing the final real demo.

   export const USE_MOCK = true;

   export function mockGenerateQuotes(topic) {
     return [
       {
         id: "mock-1",
         text: `"The essence of ${topic} lies in its contradictions."`,
         author: "Elena Voss",
       },
       {
         id: "mock-2",
         text: `"${topic} is not a destination but a practice."`,
         author: "Marcus Thane",
       },
       {
         id: "mock-3",
         text: `"In the face of ${topic}, we discover ourselves."`,
         author: "Yuki Haramoto",
       },
       {
         id: "mock-4",
         text: `"${topic} demands courage first, understanding second."`,
         author: "Adaeze Obi",
       },
     ];
   }

   export function mockGenerateImage(quoteText) {
     // Returns a stable placeholder image URL
     return "https://placehold.co/600x400?text=Quote+Image";
   }