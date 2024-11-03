import { IonActionSheet, IonAlert, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonList, IonModal, IonPage, IonRadio, IonRadioGroup, IonToolbar, isPlatform, useIonRouter, useIonViewDidEnter } from "@ionic/react"
import { useEffect, useRef, useState } from "react"
import PouchDB from 'pouchdb'
import PouchFind from 'pouchdb-find'
import CordovaSqlite from "pouchdb-adapter-cordova-sqlite"
import { RouteComponentProps } from "react-router"
import { arrowForwardSharp, checkmark, checkmarkSharp, close, closeSharp, cloudDoneSharp, cloudOfflineSharp, ellipsisVerticalSharp, folderSharp, trashSharp } from "ionicons/icons"
import { OverlayEventDetail } from "@ionic/core"
import { DuetEditor } from "../components/DuetEditor"
import NoteTitle from "../components/NoteTitle/NoteTitle"

interface NoteDetailsPageProps extends RouteComponentProps<{
  id: string
}> {}

const NoteDetails: React.FC<NoteDetailsPageProps> = ({match}) => {

  let db: PouchDB.Database
  if(isPlatform('capacitor')) {
    PouchDB.plugin(CordovaSqlite)
    db = new PouchDB('duet', {adapter: 'cordova-sqlite'})
  } else {
    db = new PouchDB('duet')
  }
  PouchDB.plugin(PouchFind)

  const router = useIonRouter()

  const [note, setNote] = useState({})
  const [editedTitle, setEditedTitle] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [projects, setProjects] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [selectedProject, setSelectedProject] = useState("")
  const [isEdited, setIsEdited] = useState(false)
  const [isUpdated, setIsUpdated] = useState(false)

  const descriptionEditModal = useRef<HTMLIonModalElement>(null)
  const moveToFolderModal = useRef<HTMLIonModalElement>(null)
  const projectPickerModal = useRef<HTMLIonModalElement>(null)
  const folderPathInputRef = useRef<HTMLIonInputElement>(null)
  const descEditor = useRef()
  const descWrapper = useRef(null)
  const deleteNoteConfirmation = useRef<HTMLIonAlertElement>(null)
  const [descEditorState, setDescEditorState] = useState()

  useIonViewDidEnter(() => {
    if ("virtualKeyboard" in navigator && isPlatform('mobile') && isPlatform('pwa') && isPlatform('android')) {
      navigator.virtualKeyboard.overlaysContent = true
    }
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

  useEffect(() => {
    if(note && note.description && editedDescription !== note.description) {
      setIsEdited(true)
    }
  }, [editedDescription])

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(async () => {
      if(isEdited) {
        await updateNoteDescription()
        setIsEdited(false)
        setIsUpdated(true)
      }
    }, 500);
    return () => clearTimeout(delayInputTimeoutId);
  }, [editedDescription, isEdited, 500]);


  const updateNoteTitle = async (title: string) => {
    if(note.title === title) {
      return
    }
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
      setEditedDescription(newNote.description)
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

  const updateNotePath = async (path: string) => {
    const timestamp = new Date().toISOString()

    let constructedPath
    let splitBySlashPath = path.split("/")
    constructedPath = `,${splitBySlashPath.toString()},`
    
    const response = await db.put({
      ...note,
      path: constructedPath,
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

  function onWillDismissDescriptionEditModal(ev: CustomEvent<OverlayEventDetail>) {
    if(ev.detail.role == 'update') {
      updateNoteDescription()
    }
  }

  function onWillDismissMoveToFolderModal(ev: CustomEvent<OverlayEventDetail>) {
    if(ev.detail.role == 'update') {
      updateNotePath(folderPathInputRef.current?.value!.toString()!)
    }
  }

  function onWillDissmissProjectPickerModal(ev: CustomEvent<OverlayEventDetail>) {
    if(ev.detail.role == 'move') {
      moveNoteToProject()
    }
  }

  function onWillPresentMoveToFolderModal(ev: CustomEvent<OverlayEventDetail>) {
    if(note.path) {
      let pathSplit = note.path.split(",")
      pathSplit.splice(0, 1)
      pathSplit.splice(pathSplit.length - 1, 2)
      let fullPath = pathSplit.toString()
      fullPath = fullPath.replaceAll(",", "/")
      folderPathInputRef.current!.value! = fullPath
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
            {
              isEdited ?
              <IonIcon color="medium" size="medium" icon={cloudOfflineSharp}></IonIcon>
              : !isEdited && isUpdated ?
              <IonIcon color="success" size="medium" icon={cloudDoneSharp}></IonIcon>
              : null
            }
            <IonButton id="openNoteActionsSheet">
              <IonIcon slot="icon-only" icon={ellipsisVerticalSharp}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <NoteTitle title={note.title} update={updateNoteTitle} />
        {
          note && note.description ?
          <DuetEditor
            markdownContent={editedDescription}
            onChange={(val) => {setEditedDescription(val)}}
            style={{
              ".cm-scroller": {
                overflow: 'auto',
                minHeight: 'calc(100vh - 88px)',
                padding: '16px',
                fontFamily: 'var(--ion-font-family)',
                paddingBottom: `calc(env(keyboard-inset-height, 16) + 16px)`
              },
              "&.cm-editor": {
                backgroundColor: (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? "#121212" : "#ffffff",
                outline: 'none'
              }
            }}
          />
          : null
        }

        <IonActionSheet
          trigger='openNoteActionsSheet'
          header='Note actions'
          buttons={[
            {
              text: 'Organize',
              icon: folderSharp,
              data: {
                action: 'move-to-folder'
              }
            },
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
            } else if(detail.data?.action == 'move-to-folder') {
              moveToFolderModal.current?.present()
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
                  fontFamily: 'var(--ion-font-family)',
                  paddingBottom: `calc(env(keyboard-inset-height, 16) + 16px)`
                },
                "&.cm-editor": {
                  backgroundColor: (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? "#121212" : "#ffffff"
                }
              }}
            />

          </IonContent>
        </IonModal>
        <IonModal ref={moveToFolderModal} onWillPresent={(ev) => onWillPresentMoveToFolderModal(ev)} onWillDismiss={(ev) => onWillDismissMoveToFolderModal(ev)}>
          <IonHeader className="ion-no-border">
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => moveToFolderModal.current?.dismiss(null, 'cancel')}>
                  <IonIcon slot='icon-only' icon={close}></IonIcon>
                </IonButton>
              </IonButtons>
              <IonButtons slot="end">
                <IonButton onClick={() => moveToFolderModal.current?.dismiss(null, 'update')}>
                  <IonIcon slot='icon-only' icon={checkmarkSharp}></IonIcon>
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonInput type="text" labelPlacement="stacked" ref={folderPathInputRef} label="Folder path" autocapitalize='sentences' autoCorrect="on" placeholder="Projects/Project Name" />
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