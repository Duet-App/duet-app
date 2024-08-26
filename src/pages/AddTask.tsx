import { TextareaCustomEvent, InputInputEventDetail, DatetimeChangeEventDetail, IonBackButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonPage, IonTextarea, IonTitle, IonToolbar, useIonRouter, useIonViewDidEnter, IonDatetimeButton, IonModal, IonDatetime, IonItem, IonLabel, IonSelect, IonSelectOption } from "@ionic/react"
import { add, checkmark } from "ionicons/icons"
import { useRef, useState } from "react"
import type { IonInputCustomEvent, TextareaChangeEventDetail, IonDatetimeCustomEvent } from '@ionic/core'
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import { useParams } from "react-router"

const AddTask: React.FC = () => {

  const db = new PouchDB('duet');
  PouchDB.plugin(PouchFind)

  const router = useIonRouter()
  let { id } = useParams()

  const input = useRef<HTMLIonInputElement>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState<string | string[] | null>()
  const [scheduledDate, setScheduledDate] = useState<string | string[] | null>()
  const [status, setStatus] = useState("Todo")

  useIonViewDidEnter(() => {
    input.current?.setFocus()
  })

  const addTask = async () => {
    let date = new Date()
    let doc = {
      "_id": crypto.randomUUID(),
      "title": title,
      "description": description,
      "type": "task",
      "status": status,
      "due_date": dueDate || null,
      "scheduled_date": scheduledDate || null,
      "project_id": id || null,
      timestamps: {
        created: date.toISOString(),
        updated: date.toISOString(),
        completed: null
      }
    }
    db.put(doc).then((response) => {
      if(response.ok) {
        if(id) {
          db.get(id).then((project) => {
            if(project.tasks) {
              let newProject = {
                ...project,
                tasks: [
                  ...project.tasks,
                  response.id
                ]
              }
              db.put(newProject).then(() => {})
            } else {
              let newProject = {
                ...project,
                tasks: [
                  response.id
                ]
              }
              db.put(newProject).then(() => {})
            }
          })
        }
      }
    })
    router.goBack()
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref="/"></IonBackButton>
          </IonButtons>
          <IonTitle>Add Task</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">

        <IonInput fill="solid" ref={input} value={title} onIonInput={(e: IonInputCustomEvent<InputInputEventDetail>) => setTitle(e.detail.value || '')} label="Task title" labelPlacement="floating" placeholder="Enter the task's title" autoFocus={true} autocapitalize='sentences' autoCorrect="on"></IonInput>

        <IonTextarea value={description} onIonInput={(e: TextareaCustomEvent<TextareaChangeEventDetail>) => setDescription(e.detail.value || '')} fill="solid" autoGrow={true} autocapitalize='sentences' autoCorrect="on" label="Description" labelPlacement="floating" placeholder="Enter a description" style={{marginTop: '16px'}}></IonTextarea>

        <IonItem style={{marginTop: '32px'}}>
          <IonLabel>
            <h2>When do you want to start this task?</h2>
            <IonDatetimeButton style={{justifyContent: 'flex-start', marginTop: 8}} datetime="scheduleddatetime"></IonDatetimeButton>
          </IonLabel>
        </IonItem>

        <IonItem style={{marginTop: '8px'}}>
          <IonLabel>
            <h2>Due date</h2>
            <IonDatetimeButton style={{justifyContent: 'flex-start', marginTop: 8}} datetime="duedatetime"></IonDatetimeButton>
          </IonLabel>
        </IonItem>

        <IonItem style={{marginTop: 32}}>
          <IonSelect value={status} onIonChange={e => setStatus(e.detail.value || '')} label="Task status" labelPlacement="stacked">
            <IonSelectOption value="Todo">Todo</IonSelectOption>
            <IonSelectOption value="Next">Next</IonSelectOption>
            <IonSelectOption value="Waiting">Waiting</IonSelectOption>
            <IonSelectOption value="Done">Done</IonSelectOption>
            <IonSelectOption value="Cancelled">Cancelled</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonModal keepContentsMounted={true}>
          <IonDatetime value={dueDate} onIonChange={(e: IonDatetimeCustomEvent<DatetimeChangeEventDetail>) => setDueDate(e.detail.value || '')} showDefaultTitle={true} showDefaultButtons={true} showClearButton={true} presentation="date" id="duedatetime">
            <span slot="title">Select due date</span>
          </IonDatetime>
        </IonModal>

        <IonModal keepContentsMounted={true}>
          <IonDatetime value={scheduledDate} onIonChange={(e: IonDatetimeCustomEvent<DatetimeChangeEventDetail>) => setScheduledDate(e.detail.value || '')} showDefaultTitle={true} showDefaultButtons={true} showClearButton={true} presentation="date" id="scheduleddatetime">
            <span slot="title">Select start date</span>
          </IonDatetime>
        </IonModal>

        <IonFab slot='fixed' vertical='bottom' horizontal='end'>
          <IonFabButton onClick={addTask}>
            <IonIcon icon={checkmark}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  )
}

export default AddTask