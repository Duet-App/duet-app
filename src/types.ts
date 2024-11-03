interface Task extends PouchDB.Core.ExistingDocument<{}> {
  title: string,
  description?: string,
  type: 'task',
  status: 'Todo' | 'Next' | 'Done' | 'Cancelled' | 'Waiting',
  due_date?: string,
  scheduled_date?: string,
  project_id?: PouchDB.Core.DocumentId,
  timestamps: {
    created: string,
    updated: string,
    completed?: string
  }
}

interface Project extends PouchDB.Core.ExistingDocument<{
  title: string,
  description: string,
  type: string,
  status: string,
  timestamps: {
    created: string,
    updated: string,
    completed?: string,
    archived?: string
  }
}> {}

type TaskItemProps = {
  task: Task,
  updateFn: () => void,
  project?: Project,
  url?: string
}