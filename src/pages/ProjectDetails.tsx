import { IonBackButton, IonBackdrop, IonButton, IonButtons, IonCheckbox, IonContent, IonFab, IonFabButton, IonFabList, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonTextarea, IonToolbar, isPlatform, useIonViewDidEnter } from "@ionic/react"
import { RouteComponentProps } from "react-router"
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import CordovaSqlite from "pouchdb-adapter-cordova-sqlite"
import { useEffect, useRef, useState } from "react"
import { formatDistance } from "date-fns"
import { add, checkmark, checkmarkSharp, chevronDownSharp, documentTextSharp } from "ionicons/icons"
import TaskItem from "../components/Tasks/TaskItem"
import NoteItem from "../components/Notes/NoteItem"
import Markdown from "react-markdown"
import Title from "../components/Title/Title"

interface ProjectDetailsPageProps extends RouteComponentProps<{
  id: string
}> {}

const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({match}) => {

  let db: PouchDB.Database
  if(isPlatform('capacitor')) {
    PouchDB.plugin(CordovaSqlite)
    db = new PouchDB('duet', {adapter: 'cordova-sqlite'})
  } else {
    db = new PouchDB('duet')
  }
  PouchDB.plugin(PouchFind)

  const [project, setProject] = useState({})
  const [projectTasks, setProjectTasks] = useState([])
  const [projectNotes, setProjectNotes] = useState([])
  const [completedProjectTasks, setCompletedProjectTasks] = useState([])
  const [showCompleted, setShowCompleted] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const fabRef = useRef<HTMLIonFabElement>(null)

  const [description, setDescription] = useState("")

  const [projectDescEditing, setProjectDescEditing] = useState(false)
  const projectDescEditor = useRef<HTMLIonTextareaElement>(null)

  useIonViewDidEnter(() => {
    getProject()
  })

  async function getProject() {
    const doc = await db.get(match.params.id, {latest: true})
    setProject(doc)
    setDescription(doc.description)
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

  const updateProjectTitle = async (title: string) => {
    const timestamp = new Date().toISOString()
    
    const response = await db.put({
      ...project,
      title: title,
      timestamps: {
        ...project.timestamps,
        updated: timestamp,
      }
    })
    if(response.ok) {
      const newProject = await db.get(project._id, {latest: true})
      setProject(newProject)
    }
  }

  const updateProjectDescription = async () => {
    const timestamp = new Date().toISOString()
    
    const response = await db.put({
      ...project,
      description: description,
      timestamps: {
        ...project.timestamps,
        updated: timestamp,
      }
    })
    if(response.ok) {
      const newProject = await db.get(project._id, {latest: true})
      setProject(newProject)
      setDescription(newProject.description)
      setProjectDescEditing(false)
    }
  }

  const toggleCompletedTaskView = () => {
    setShowCompleted(showCompleted ? false : true)
  }

  return (
    <IonPage>
      <IonBackdrop
        visible={overlayVisible}
        style={{opacity: 0.15, zIndex: overlayVisible ? 11 : -1, transition: 'opacity,background 0.25s ease-in-out'}}
      ></IonBackdrop>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref='/'></IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{padding: '16px 16px 0'}}>
          {/* <h3>{project.title}</h3> */}
          <Title title={project.title} update={updateProjectTitle} />
          {
            !projectDescEditing
            ? <div
              style={{color: project.description ? 'initial' : 'var(--ion-color-medium)'}}
              onClick={() => {
                setProjectDescEditing(true)
              }}
            >
              <Markdown
              >
                {project.description ? project.description : 'Tap to set a description'}
              </Markdown>
            </div>
            : <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8}}>
              <IonTextarea ref={projectDescEditor} value={description} onIonInput={(e) => {setDescription(e.detail.value!)}} aria-label="Description" placeholder="Enter description" autoGrow={true} rows={1}></IonTextarea>
              <IonButton size="small" onClick={updateProjectDescription}>
                <IonIcon slot="icon-only" icon={checkmarkSharp}></IonIcon>
              </IonButton>
            </div>
          }
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
            <IonListHeader>
              <IonLabel>Completed</IonLabel>
              <IonButton size="small" onClick={toggleCompletedTaskView}>{ showCompleted ? "Hide" : "Show" }</IonButton>
            </IonListHeader>
            {
              showCompleted
              ? completedProjectTasks.map(task => {
                return (
                  <TaskItem key={task._id} task={task} updateFn={getProject} />
                )
              })
              : null
            }
          </IonList>
          : null
        }
 
        {
          projectNotes.length > 0
          ? <>
          <IonList style={{marginTop: showCompleted ? 24 : 8}}>
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

        <IonFab ref={fabRef} onClick={() => {fabRef.current?.activated ? setOverlayVisible(true) : setOverlayVisible(false)}} slot='fixed' vertical='bottom' horizontal='end'>
          <IonFabButton>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
          <IonFabList side="top">
            <IonFabButton routerLink={"/project/add-task/" + match.params.id}>
              <IonIcon icon={checkmarkSharp}></IonIcon>
            </IonFabButton>
            <IonFabButton routerLink={"/notes/add/" + match.params.id}>
              <IonIcon icon={documentTextSharp}></IonIcon>
            </IonFabButton>
          </IonFabList>
        </IonFab>
      </IonContent>
    </IonPage>
  )
}

export default ProjectDetailsPage