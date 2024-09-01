import { IonActionSheet, IonAlert, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonList, IonModal, IonPage, IonRadio, IonRadioGroup, IonTextarea, IonToolbar, TextareaChangeEventDetail, TextareaCustomEvent, useIonRouter, useIonViewDidEnter } from "@ionic/react"
import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react"
import Markdown from "react-markdown"
import PouchDB from 'pouchdb'
import PouchFind from 'pouchdb-find'
import { RouteComponentProps } from "react-router"
import { arrowForwardSharp, checkmark, checkmarkSharp, close, closeSharp, ellipsisVerticalSharp, folderSharp, trashSharp } from "ionicons/icons"
import { OverlayEventDetail } from "@ionic/core"
import { DuetEditor } from "../components/DuetEditor"
import NoteTitle from "../components/NoteTitle/NoteTitle"

interface NoteDetailsPageProps extends RouteComponentProps<{
  id: string
}> {}

const NoteDetails: React.FC<NoteDetailsPageProps> = ({match}) => {

  const db = new PouchDB('duet')
  PouchDB.plugin(PouchFind)

  const router = useIonRouter()

  const [note, setNote] = useState({})
  const [editedTitle, setEditedTitle] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [projects, setProjects] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [selectedProject, setSelectedProject] = useState("")

  const descriptionEditModal = useRef<HTMLIonModalElement>(null)
  const projectPickerModal = useRef<HTMLIonModalElement>(null)
  const descEditor = useRef()
  const descWrapper = useRef(null)
  const deleteNoteConfirmation = useRef<HTMLIonAlertElement>(null)
  const [descEditorState, setDescEditorState] = useState()

  useIonViewDidEnter(() => {
    function getNoteDetails() {
      db.get(match.params.id).then((noteResponse: object) => {
        setNote(noteResponse)
        setEditedTitle(noteResponse.title)
        setEditedDescription(noteResponse.description)
        getProjects()
      })
    }

    function getProjects() {
      db.find({
        selector: {
          type: "project",
        },
        // "use_index": ['inbox-items', 'inbox-items'],
        // sort: [{'timestamps.created': 'asc'}, {'title': 'asc'}]
      })
      .then((result: object | null) => {
        if(result) {
          setProjects(result.docs)
          setLoaded(true)
        }
      }).catch((err: Error) => {
        console.log(err)
      })
    }
    getNoteDetails()
  })

  // useCallback(() => {
  //   if(descEditor.current) {
  //     descEditor.current.focus()
  //   }
  // }, [])

  const updateNoteTitle = async (title: string) => {
    setNote({...note, title: title})
    const timestamp = new Date().toISOString()
    
    const response = await db.put({
      ...note,
      title: title,
      timestamps: {
        ...note.timestamps,
        updated: timestamp,
      }
    })
    if(response.ok) {
      const newNote = await db.get(note._id, {latest: true})
      setNote(newNote)
    }
  }

  const updateNoteDescription = async () => {
    const timestamp = new Date().toISOString()
    
    const response = await db.put({
      ...note,
      description: editedDescription,
      timestamps: {
        ...note.timestamps,
        updated: timestamp,
      }
    })
    if(response.ok) {
      const newNote = await db.get(note._id, {latest: true})
      setNote(newNote)
    }
  }

  const moveNoteToProject = async () => {

    const timestamp = new Date().toISOString()

    db.put({
      ...note,
      project_id: selectedProject,
      timestamps: {
        ...note.timestamps,
        updated: timestamp
      }
    }).then((response) => {
      if(response.ok) {
        db.get(note._id, {latest: true}).then((response1) => {
          setNote(response1)
          db.get(selectedProject, {latest: true}).then((response2) => {
            let project = response2
            let newProject
            if(project.notes) {
              newProject = [...project.notes, match.params.id]
            } else {
              newProject = [match.params.id]
            }
            db.put({
              ...project,
              notes: newProject,
              timestamps: {
                ...project.timestamps,
                updated: timestamp
              }
            }).then((response3) => {})
          })
        })
      }
    })
  }

  function onWillDismissDescriptionEditModal(ev: CustomEvent<OverlayEventDetail>) {
    if(ev.detail.role == 'update') {
      updateNoteDescription()
    }
  }

  function onWillDissmissProjectPickerModal(ev: CustomEvent<OverlayEventDetail>) {
    if(ev.detail.role == 'move') {
      moveNoteToProject()
    }
  }

  const deleteNote = () => {
    db.remove(note).then(response => {
      if(response.ok) {
        router.goBack()
      }
    })
  }

  useEffect(() => {
    if(descEditor.current) {
      descEditor.current.focus()
    }
  }, [descEditor])

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref="/"></IonBackButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton id="openNoteActionsSheet">
              <IonIcon slot="icon-only" icon={ellipsisVerticalSharp}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <NoteTitle title={note.title} update={updateNoteTitle} />
        <div id="openDescriptionEditModal" style={{padding: '0 16px', height: "100%"}}>
          <Markdown>
            {note.description}
          </Markdown>
        </div>

        <IonActionSheet
          trigger='openNoteActionsSheet'
          header='Note actions'
          buttons={[
            {
              text: 'Move to project',
              icon: arrowForwardSharp,
              data: {
                action: 'move-to-project'
              }
            },
            {
              text: 'Delete',
              icon: trashSharp,
              role: 'destructive',
              data: {
                action: 'delete-note'
              }
            },
            {
              text: 'Cancel',
              icon: closeSharp,
              role: 'cancel',
              data: {
              }
            }
          ]}
          onDidDismiss={({detail}) => {
            if(detail.data?.action == 'move-to-project') {
              projectPickerModal.current?.present()
            } else if(detail.data?.action == 'delete-note') {
              deleteNoteConfirmation.current?.present()
            }
          }}
        ></IonActionSheet>

        <IonModal ref={descriptionEditModal} trigger="openDescriptionEditModal" onWillDismiss={(ev) => onWillDismissDescriptionEditModal(ev)} onDidPresent={
          (e) => {
            if(descEditor.current) {
              console.log("Mounted", descEditor.current)
              console.log("descWrapper", descWrapper)
              descEditor.current.refresh()
              descEditor.current.focus()
            }
          }
        }>
          <IonHeader className="ion-no-border">
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => descriptionEditModal.current?.dismiss(null, 'cancel')}>
                  <IonIcon slot='icon-only' icon={close}></IonIcon>
                </IonButton>
              </IonButtons>
              <IonButtons slot="end">
                <IonButton onClick={() => descriptionEditModal.current?.dismiss(null, 'update')}>
                  <IonIcon slot='icon-only' icon={checkmark}></IonIcon>
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>

            <DuetEditor
              markdownContent={editedDescription}
              onChange={(val) => {setEditedDescription(val)}}
              style={{
                ".cm-scroller": {
                  overflow: 'auto',
                  minHeight: 'calc(100vh - 88px)',
                  padding: '16px',
                  fontFamily: 'var(--ion-font-family)'
                },
                "&.cm-editor": {
                  backgroundColor: "#121212"
                }
              }}
            />

          </IonContent>
        </IonModal>
        <IonModal ref={projectPickerModal} onWillDismiss={(ev) => onWillDissmissProjectPickerModal(ev)} initialBreakpoint={0.35} breakpoints={[0, 0.35, 1]}>
          <IonHeader className="ion-no-border">
            <IonToolbar>
              <IonButtons slot='start'>
                <IonButton onClick={() => {projectPickerModal.current?.dismiss(null, 'cancel')}}>
                  <IonIcon slot='icon-only' icon={closeSharp}></IonIcon>
                </IonButton>
              </IonButtons>
              <IonButtons slot='end'>
                <IonButton onClick={() => {projectPickerModal.current?.dismiss(null, 'move')}}>
                  <IonIcon slot='icon-only' icon={checkmarkSharp}></IonIcon>
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className='ion-padding'>
            <IonList>
              <IonRadioGroup value={selectedProject} onIonChange={(e) => {setSelectedProject(e.target.value)}}>
                {
                  projects.map(project => {
                    return (
                      <IonItem key={project._id} onClick={() => {projectPickerModal.current?.setCurrentBreakpoint(1)}}>
                        <IonRadio mode='ios' justify='space-between' labelPlacement="start" value={project._id}>{project.title}</IonRadio>
                      </IonItem>
                    )
                  })
                }
              </IonRadioGroup>
            </IonList>
          </IonContent>
        </IonModal>
        <IonAlert
          ref={deleteNoteConfirmation}
          // trigger="task-delete-confirmation"
          header="Delete Note?"
          message="This will permanently remove the note. Do you wish to continue?"
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Delete',
              role: 'confirm'
            }
          ]}
          onDidDismiss={({detail}) => {
            if(detail.role == 'confirm') {
              deleteNote()
            }
          }}
        ></IonAlert>
      </IonContent>

    </IonPage>
  )
}

export default NoteDetails