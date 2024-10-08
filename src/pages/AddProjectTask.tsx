import { TextareaCustomEvent, InputInputEventDetail, DatetimeChangeEventDetail, IonBackButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonPage, IonTextarea, IonTitle, IonToolbar, useIonRouter, useIonViewDidEnter, IonDatetimeButton, IonModal, IonDatetime, IonItem, IonLabel, IonSelect, IonSelectOption, isPlatform } from "@ionic/react"
import { add, checkmark } from "ionicons/icons"
import { useRef, useState } from "react"
import type { IonInputCustomEvent, TextareaChangeEventDetail, IonDatetimeCustomEvent } from '@ionic/core'
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import CordovaSqlite from "pouchdb-adapter-cordova-sqlite"
import { RouteComponentProps, useHistory } from "react-router"

interface AddProjectTaskPageProps extends RouteComponentProps<{
  id: string
}> {}

const AddProjectTask: React.FC<AddProjectTaskPageProps> = ({match}) => {

  let db: PouchDB.Database
  if(isPlatform('capacitor')) {
    PouchDB.plugin(CordovaSqlite)
    db = new PouchDB('duet', {adapter: 'cordova-sqlite'})
  } else {
    db = new PouchDB('duet');
  }
  PouchDB.plugin(PouchFind)

  const router = useIonRouter()
  const history = useHistory()

  const input = useRef<HTMLIonInputElement>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  useIonViewDidEnter(() => {
    input.current?.setFocus()
    setTitle("")
    setDescription("")
  })

  const addTask = () => {
    let date = new Date()
    let doc = {
      "_id": crypto.randomUUID(),
      "title": title,
      "description": description,
      "type": "task",
      "status": "Todo",
      "due_date": null,
      "scheduled_date": null,
      "project_id": match.params.id,
      timestamps: {
        created: date.toISOString(),
        updated: date.toISOString(),
        completed: null
      }
    }
    db.put(doc).then(() => {
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

        {
          title.length > 0 &&
          <IonFab slot='fixed' vertical='bottom' horizontal='end'>
            <IonFabButton onClick={addTask}>
              <IonIcon icon={checkmark}></IonIcon>
            </IonFabButton>
          </IonFab>
        }
      </IonContent>
    </IonPage>
  )
}

export default AddProjectTask