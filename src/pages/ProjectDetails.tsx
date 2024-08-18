import { IonBackButton, IonButtons, IonCheckbox, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonToolbar, useIonViewDidEnter } from "@ionic/react"
import { RouteComponentProps } from "react-router"
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import { useState } from "react"
import { formatDistance } from "date-fns"
import { add } from "ionicons/icons"
import TaskItem from "../components/Tasks/TaskItem"
import NoteItem from "../components/Notes/NoteItem"

interface ProjectDetailsPageProps extends RouteComponentProps<{
  id: string
}> {}

const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({match}) => {

  const db = new PouchDB('duet')
  PouchDB.plugin(PouchFind)

  const [project, setProject] = useState({})
  const [projectTasks, setProjectTasks] = useState([])
  const [projectNotes, setProjectNotes] = useState([])
  const [completedProjectTasks, setCompletedProjectTasks] = useState([])

  useIonViewDidEnter(() => {
    getProject()
  })

  async function getProject() {
    const doc = await db.get(match.params.id, {latest: true})
    setProject(doc)
    getProjectTasks()
    getProjectNotes()
  }

  async function getProjectTasks() {
    const result = await db.query('projects-ddoc/project-tasks', {
      startkey: [match.params.id],
      endkey: [match.params.id, {}],
      include_docs: true
    })
    if(result.rows) {
      let tasks = []
      let completedTasks = []
      result.rows.forEach(row => {
        tasks.push(row.doc)
        completedTasks.push(row.doc)
      });
      tasks = tasks.filter(t => (t.status != "Done")).filter(t => t.status != "Cancelled")
      completedTasks = completedTasks.filter(t => (t.status == "Done"))
      setProjectTasks(tasks)
      setCompletedProjectTasks(completedTasks)
    }
  }

  async function getProjectNotes() {
    const result = await db.query('projects-notes-ddoc/project-notes', {
      startkey: [match.params.id],
      endkey: [match.params.id, {}],
      include_docs: true
    })
    if(result.rows) {
      let notes = []
      result.rows.forEach(row => {
        notes.push(row.doc)
      });
      setProjectNotes(notes)
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref='/'></IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{padding: '16px 16px 0'}}>
          <h3>{project.title}</h3>
          <p style={{color: project.description ? 'initial' : 'var(--ion-color-medium)'}}>{project.description ? project.description : 'Tap to set a description'}</p>
        </div>

        {
          projectTasks.length > 0
          ? <IonList style={{marginTop: 32}}>
            {
              projectTasks.map(task => {
                return (
                  <TaskItem key={task._id} task={task} updateFn={getProject} />
                  // <IonItem key={task._id} routerLink={"/tasks/" + task._id}>
                  //   <IonCheckbox slot="start"></IonCheckbox>
                  //   <IonLabel
                  //     style={{textDecoration: (task.status == "Done" || task.status == "Cancelled") ? 'line-through' : 'none'}}
                  //     color={(task.status == "Done" || task.status == "Cancelled") ? 'medium' : 'initial'}
                  //   >
                  //     {task.title}
                  //   </IonLabel>
                  // </IonItem>
                )
              })
            }
          </IonList>
          : <p className="ion-padding" style={{color: 'var(--ion-color-medium)'}}>No tasks found! Add a task to <strong>"{project.title}"</strong> by clicking on the "+" button below.</p>
        }

        {
          completedProjectTasks.length > 0
          ? <IonList style={{marginTop: 24}}>
            <IonListHeader>Completed</IonListHeader>
            {
              completedProjectTasks.map(task => {
                return (
                  <TaskItem key={task._id} task={task} updateFn={getProject} />
                  // <IonItem key={task._id} routerLink={"/tasks/" + task._id}>
                  //   <IonCheckbox checked={true} slot="start"></IonCheckbox>
                  //   <IonLabel
                  //     style={{textDecoration: (task.status == "Done" || task.status == "Cancelled") ? 'line-through' : 'none'}}
                  //     color={(task.status == "Done" || task.status == "Cancelled") ? 'medium' : 'initial'}
                  //   >
                  //     {task.title}
                  //   </IonLabel>
                  // </IonItem>
                )
              })
            }
          </IonList>
          : null
        }
 
        {
          projectNotes.length > 0
          ? <>
          <IonList style={{marginTop: 24}}>
            <IonListHeader>Project Support Material</IonListHeader>
            {
              projectNotes.map(note => {
                return (
                  <NoteItem key={note._id} note={note} />
                )
              })
            }
          </IonList>
          </>
          : null
        }

        <div style={{marginTop: 32, padding: '16px'}}>
          <small style={{display: 'block', marginBottom: 8, color: 'var(--ion-color-medium)'}}>
            Created: {project.timestamps ? formatDistance(project.timestamps.created, Date.now()) + ' ago' : ''}
          </small>
          <small style={{display: 'block', marginBottom: 8, color: 'var(--ion-color-medium)'}}>
            Updated: {project.timestamps ? formatDistance(project.timestamps.updated, Date.now()) + ' ago' : ''}
          </small>
          {
            (project.timestamps && project.timestamps.completed)
            ? <small style={{display: 'block', marginBottom: 8, color: 'var(--ion-color-medium)'}}>
              Completed: {(project.timestamps && project.timestamps.completed) ? formatDistance(project.timestamps.completed, Date.now()) + ' ago' : ''}
            </small>
            : null
          }
        </div>

        <IonFab slot='fixed' vertical='bottom' horizontal='end'>
          <IonFabButton routerLink={"/project/add-task/" + match.params.id}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  )
}

export default ProjectDetailsPage