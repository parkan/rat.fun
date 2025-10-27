export default {
  title: "Stats",
  name: "statistics",
  type: "document",
  fields: [
    {
      title: "Title",
      name: "title",
      type: "string",
      validation: (Rule: any) => Rule.required()
    },
    {
      title: "World address",
      name: "worldAddress",
      type: "string",
      readOnly: true,
      validation: (Rule: any) => Rule.required()
    },
    {
      title: "Rat total balance",
      name: "ratTotalBalance",
      type: "number",
      readOnly: true,
      validation: (Rule: any) => Rule.required()
    },
    {
      title: "Trip total balance",
      name: "tripTotalBalance",
      type: "number",
      readOnly: true,
      validation: (Rule: any) => Rule.required()
    },
    // Net balance (rats + trips) - should be near zero if system is balanced
    {
      title: "Total balance",
      name: "totalBalance",
      type: "number",
      readOnly: true,
      validation: (Rule: any) => Rule.required()
    },
    // Total absolute value moved through the system
    {
      title: "Total throughput",
      name: "totalThroughput",
      type: "number",
      readOnly: true,
      validation: (Rule: any) => Rule.required()
    }
  ]
}
