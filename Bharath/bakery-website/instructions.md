# How to Use the Prompt Modules

This project is structured into **10 individual modules** available in `PROMPTS.md`. To build Rizu Cake World application effectively, you should run these modules step-by-step rather than all at once.

## Execution Instructions

1. **Sequential Execution**  
   Start from **Module 1** and proceed sequentially. Do not feed the next module to the AI until the current one is fully completed and verified.

2. **Context Passing**  
   When pasting a module prompt to the AI, assure it has the context of what was already built. You can use a prompt like:
   > "We are building a Next.js full-stack bakery e-commerce app. We just finished Module 1 (Project Setup). Now, please execute the following: [paste Module 2 context]"

3. **Verify and Test**  
   After the AI provides the code for a module:
   - Apply the changes to your codebase.
   - Run the development server (`pnpm dev`).
   - Check for syntax errors, build errors, and logical bugs.
   - Only proceed to the next module when the current features are stable.

4. **Iterative Fixing**  
   If an error occurs, provide the error message back to the AI to fix the specific module you are on. Do not move to the next step until the current one works flawlessly.

## Module Checklist

- [ ] **Module 1**: Project Setup and Architecture
- [ ] **Module 2**: Database Setup (Neon + Drizzle)
- [ ] **Module 3**: Authentication (Clerk)
- [ ] **Module 4**: Landing Page
- [ ] **Module 5**: Product Catalog (Dashboard)
- [ ] **Module 6**: Shopping Cart
- [ ] **Module 7**: Order System
- [ ] **Module 8**: UI Design System
- [ ] **Module 9**: Stitch MCP Integration
- [ ] **Module 10**: Future Enhancements
