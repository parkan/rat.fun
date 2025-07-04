export default {
  title: "Test prompts",
  name: "testPrompts",
  type: "document",
  fields: [
    {
      title: "Title",
      name: "title",
      type: "string",
      readOnly: true,
      validation: (Rule: any) => Rule.required()
    },
    {
      title: "Event prompt A",
      type: "reference",
      name: "eventPromptA",
      to: [{ type: "prompt" }],
      validation: (Rule: any) => Rule.required()
    },
    {
      title: "Event prompt B",
      type: "reference",
      name: "eventPromptB",
      to: [{ type: "prompt" }],
      validation: (Rule: any) => Rule.required()
    },
    {
      title: "Correction prompt A",
      type: "reference",
      name: "correctionPromptA",
      to: [{ type: "prompt" }],
      validation: (Rule: any) => Rule.required()
    },
    {
      title: "Correction prompt B",
      type: "reference",
      name: "correctionPromptB",
      to: [{ type: "prompt" }],
      validation: (Rule: any) => Rule.required()
    }
  ]
}
