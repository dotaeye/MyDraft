module.exports = {
  columns: [
    {
      id: "column1",
      flex: 1,
      flexOptions: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center"
      },
      components: [],
      rows: [
        {
          id: "row1",
          flex: 1,
          flexOptions: {
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center"
          },
          columns: [],
          components: [
            {
              id: "component1",
              type: "text",
              flex: 1,
       
              options: {
                textAlign: "center",
                fontSize: 2,
                singleRow: true
              }
            },
            {
              id: "component2",
              type: "text",
              flex: 1,
              options: {
                textAlign: "left",
                singleRow: false,
                allowAutoHeight: true
              }
            }
          ]
        },
        {
          id: "row2",
          flex: 1,
          columns: [],
          flexOptions: {
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center"
          },
          components: [
            {
              id: "component3",
              type: "text",
              flex: 1,
              options: {
                textAlign: "left",
                singleRow: false
              }
            },

            {
              id: "component5",
              type: "image",
              flex: 1,
              options: {
                themes: 9
              }
            }
          ]
        }
      ]
    },
    {
      id: "column2",
      flex: 1,
      components: [],
      rows: [
        {
          id: "row3",
          flex: 1,
          columns: [],
          flexOptions: {
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center"
          },
          components: [
            {
              id: "component4",
              type: "image",
              options: {
                themes: 6
              }
            }
          ]
        }
      ]
    }
  ]
};
