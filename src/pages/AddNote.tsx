import { TextareaCustomEvent, InputInputEventDetail, DatetimeChangeEventDetail, IonBackButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonPage, IonTextarea, IonTitle, IonToolbar, useIonRouter, useIonViewDidEnter, IonDatetimeButton, IonModal, IonDatetime, IonItem, IonLabel, IonSelect, IonSelectOption } from "@ionic/react"
import { add, checkmark } from "ionicons/icons"
import { useRef, useState } from "react"
import type { IonInputCustomEvent, TextareaChangeEventDetail, IonDatetimeCustomEvent } from '@ionic/core'
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import './Editor.css'
import { BlockTypeSelect, BoldItalicUnderlineToggles, InsertThematicBreak, ListsToggle, MDXEditor, MDXEditorMethods, UndoRedo, headingsPlugin, listsPlugin, markdownShortcutPlugin, thematicBreakPlugin, toolbarPlugin } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { DuetEditor } from "../components/DuetEditor"

const AddNote: React.FC = () => {

  const db = new PouchDB('duet');
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
    let doc = {
      "_id": crypto.randomUUID(),
      "title": title,
      "description": description,
      "type": "note",
      timestamps: {
        created: date.toISOString(),
        updated: date.toISOString(),
      }
    }
    db.put(doc).then(() => {
    })
    router.goBack()
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref="/"></IonBackButton>
          </IonButtons>
          <IonTitle>Add Note</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">

        <IonInput fill="solid" ref={input} value={title} onIonInput={(e: IonInputCustomEvent<InputInputEventDetail>) => setTitle(e.detail.value || '')} label="Note title" labelPlacement="floating" placeholder="Enter the note's title" autoFocus={true} autocapitalize='sentences' autoCorrect="on" style={{marginBottom: '12px'}}></IonInput>

        {/* <IonTextarea value={description} onIonInput={(e: TextareaCustomEvent<TextareaChangeEventDetail>) => setDescription(e.detail.value || '')} fill="solid" autoGrow={true} label="Description" labelPlacement="floating" placeholder="Enter a description" style={{marginTop: '16px'}}></IonTextarea> */}

        {/* <MDXEditor
          ref={descEditor}
          markdown={description}
          onChange={setDescription}
          placeholder="Note"
          plugins={
            [
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    {' '}
                    <UndoRedo />
                    <BlockTypeSelect />
                    <BoldItalicUnderlineToggles />
                    <ListsToggle />
                    <InsertThematicBreak />
                  </>
                )
              }),
              headingsPlugin(),
              listsPlugin(),
              thematicBreakPlugin(),
              markdownShortcutPlugin()
            ]
          } 
        /> */}

        <DuetEditor
          markdownContent={description}
          onChange={(val) => {setDescription(val)}}
          style={{
            ".cm-scroller": {
              padding: '8px',
              height: '80vh',
              fontFamily: 'var(--ion-font-family)'
            },
          }}
        />

        <IonFab slot='fixed' vertical='bottom' horizontal='end'>
          <IonFabButton onClick={addNote}>
            <IonIcon icon={checkmark}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  )
}

export default AddNote