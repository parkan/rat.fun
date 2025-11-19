export default {
  title: "Trip Folder List",
  name: "tripFolderList",
  type: "document",
  fields: [
    {
      title: "Title",
      name: "title",
      type: "string",
      validation: (Rule: any) => Rule.required()
    },
    {
      title: "Folders",
      name: "folders",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "tripFolder" }]
        }
      ],
      validation: (Rule: any) => Rule.required().min(1)
    },
    {
      title: "Whitelist",
      name: "whitelist",
      type: "array",
      of: [{ type: "string" }],
      description: "Ethereum addresses allowed to create trips in restricted folders"
    }
  ]
}
