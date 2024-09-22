import { TextareaCustomEvent, InputInputEventDetail, DatetimeChangeEventDetail, IonBackButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonPage, IonTextarea, IonTitle, IonToolbar, useIonRouter, useIonViewDidEnter, IonDatetimeButton, IonModal, IonDatetime, IonItem, IonLabel, IonSelect, IonSelectOption, isPlatform } from "@ionic/react"
import { add, checkmark } from "ionicons/icons"
import { useRef, useState } from "react"
import type { IonInputCustomEvent, TextareaChangeEventDetail, IonDatetimeCustomEvent } from '@ionic/core'
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import CordovaSqlite from "pouchdb-adapter-cordova-sqlite"
import './Editor.css'
import { BlockTypeSelect, BoldItalicUnderlineToggles, InsertThematicBreak, ListsToggle, MDXEditor, MDXEditorMethods, UndoRedo, headingsPlugin, listsPlugin, markdownShortcutPlugin, thematicBreakPlugin, toolbarPlugin } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { DuetEditor } from "../components/DuetEditor"
import NoteTitle from "../components/NoteTitle/NoteTitle"
import { RouteComponentProps } from "react-router"

interface AddNotePageProps extends RouteComponentProps<{
  id?: string
}> {}

const AddNote: React.FC<AddNotePageProps> = ({match}) => {

  let db: PouchDB.Database
  if(isPlatform('capacitor')) {
    PouchDB.plugin(CordovaSqlite)
    db = new PouchDB('duet', {adapter: 'cordova-sqlite'})
  } else {
    db = new PouchDB('duet');
  }
  PouchDB.plugin(PouchFind)
  const router = useIonRouter()

  const input = useRef<HTMLIonInputElement>(null)
  const descEditor = useRef<MDXEditorMethods>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  useIonViewDidEnter(() => {
    input.current?.setFocus()
  })

  const addNote = () => {
    let date = new Date()
    let noteId = crypto.randomUUID()
    let doc = {
      "_id": noteId,
      "title": title,
      "description": description,
      "type": "note",
      timestamps: {
        created: date.toISOString(),
        updated: date.toISOString(),
      }
    }
    if(match.params.id) {
      let newDoc = {
        ...doc,
        project_id: match.params.id
      }
      doc = newDoc
    }
    db.put(doc).then(() => {
    })
    if(match.params.id) {
      db.get(match.params.id).then(result => {
        let notes
        if(result.notes) {
          notes = [...result.notes, noteId]
        } else {
          notes = [noteId]
        }
        db.put({
          ...result,
          notes: notes,
          timestamps: {
            ...result.timestamps,
            updated: date.toISOString()
          }
        }).then(() => {})
      })
    }
    router.goBack()
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref="/"></IonBackButton>
          </IonButtons>
          <IonTitle>Add Note</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>

        {/* <IonInput fill="solid" ref={input} value={title} onIonInput={(e: IonInputCustomEvent<InputInputEventDetail>) => setTitle(e.detail.value || '')} label="Note title" labelPlacement="floating" placeholder="Enter the note's title" autoFocus={true} autocapitalize='sentences' autoCorrect="on" style={{marginBottom: '12px'}}></IonInput> */}

        <NoteTitle title={title} update={(value) => {setTitle(value)}} />

        <DuetEditor
          markdownContent={description}
          onChange={(val) => {setDescription(val)}}
          style={{
            ".cm-scroller": {
              padding: '8px',
              height: '80vh',
              fontFamily: 'var(--ion-font-family)'
            },
            "&.cm-editor": {
              backgroundColor: (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? "#121212" : "#ffffff"
            }
          }}
        />

        {
          title.length > 0 &&
          <IonFab slot='fixed' vertical='bottom' horizontal='end'>
            <IonFabButton onClick={addNote}>
              <IonIcon icon={checkmark}></IonIcon>
            </IonFabButton>
          </IonFab>
        }
      </IonContent>
    </IonPage>
  )
}

export default AddNote