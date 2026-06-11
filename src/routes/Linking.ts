const config = {
    screens: {
        TaskDetails:{
          path: 'TaskDetails/:taskId/:assignedToId',
          parse: {
            taskId: (taskId: string) => `${taskId}`
          }
        }
    }
}

const linking = {
    prefixes: ["arkflow://"],
    config,
  };

export default linking