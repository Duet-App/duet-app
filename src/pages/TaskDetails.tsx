import { CheckboxChangeEventDetail, DatetimeChangeEventDetail, SelectChangeEventDetail, TextareaChangeEventDetail, IonBackButton, IonButtons, IonContent, IonDatetime, IonDatetimeButton, IonHeader, IonItem, IonLabel, IonList, IonModal, IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar, IonButton, IonInput, IonIcon, IonTextarea, IonChip, IonRow, IonText, IonItemOption, IonCheckbox, IonActionSheet, IonRadioGroup, IonRadio, IonGrid, IonCol, IonSpinner, IonFooter, IonAlert, useIonRouter, IonListHeader, useIonViewDidEnter, isPlatform, IonToggle, useIonToast } from '@ionic/react'
import PouchDB from 'pouchdb'
import PouchFind from 'pouchdb-find'
import CordovaSqlite from 'pouchdb-adapter-cordova-sqlite'
import { useEffect, useRef, useState } from 'react'
import { RouteComponentProps } from 'react-router'
import { IonCheckboxCustomEvent, IonDatetimeCustomEvent, IonSelectCustomEvent, OverlayEventDetail, TextareaCustomEvent } from '@ionic/core'
import './TaskDetails.css'
import { archiveOutline, arrowBackSharp, arrowForwardSharp, checkmark, checkmarkCircle, checkmarkSharp, close, closeCircle, closeOutline, closeSharp, ellipsisVerticalSharp, pricetagsOutline, timeOutline, toggle, trashSharp } from 'ionicons/icons'
import Markdown from 'react-markdown'
import Title from '../components/Title/Title'
import Description from '../components/Title/Description'
import { add, addDays, addHours, addMonths, addWeeks, addYears, format, formatDistance, formatRelative } from 'date-fns'

interface TaskDetailsPageProps extends RouteComponentProps<{
  projectid?: string,
  id: string
}> {}

const TaskDetails: React.FC<TaskDetailsPageProps> = ({match}) => {

  // console.log("ProjectID", match.params.projectid!)
  console.log("TaskID", match.params.id)

  let db: PouchDB.Database
  if(isPlatform('capacitor')) {
    PouchDB.plugin(CordovaSqlite)
    db = new PouchDB('duet', {adapter: 'cordova-sqlite'})
  } else {
    db = new PouchDB('duet')
  }
  PouchDB.plugin(PouchFind)

  const router = useIonRouter()

  const recursModal = useRef<HTMLIonModalElement>(null);
  const tagPickerModal = useRef<HTMLIonModalElement>(null)
  const titleEditModal = useRef<HTMLIonModalElement>(null)
  const projectPickerModal = useRef<HTMLIonModalElement>(null)
  const deleteTaskConfirmation = useRef<HTMLIonAlertElement>(null)
  const subtaskInput = useRef<HTMLIonInputElement>(null)
  const recursEveryInput = useRef<HTMLIonInputElement>(null)
  const recursDurationSelect = useRef<HTMLIonSelectElement>(null)

  const [task, setTask] = useState({})
  const [status, setStatus] = useState("Todo")
  const [scheduledDate, setScheduledDate] = useState<string|string[]>()
  const [dueDate, setDueDate] = useState<string|string[]>()
  const [editedDescription, setEditedDescription] = useState("")
  const [editedTitle, setEditedTitle] = useState("")
  const [subtasks, setSubtasks] = useState([])
  const [tags, setTags] = useState([])
  const [recurs, setRecurs] = useState({})
  const [recursEnabled, setRecursEnabled] = useState<boolean>(false)
  const [recursEvery, setRecursEvery] = useState<number|null>()
  const [recursDuration, setRecursDuration] = useState<string|null>()
  const [allTags, setAllTags] = useState([])
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState("")
  const [loaded, setLoaded] = useState(false)

  const [presentSnackbar] = useIonToast()

  useIonViewDidEnter(() => {
    getTask()
  })

  async function getTask() {
    db.get(match.params.id, {latest: true}).then((doc) => {
      setTask(doc)
      setSubtasks(doc.subtasks ? doc.subtasks : [])
      setEditedTitle(doc.title)
      setEditedDescription(doc.description)
      setStatus(doc.status)
      setScheduledDate(doc.scheduled_date)
      setDueDate(doc.due_date)
      setTags(doc.tags ? doc.tags : [])
      setRecurs(doc.recurs ? doc.recurs : {})
      setRecursEnabled(doc.recurs && doc.recurs.recurs ? true : false)
      setRecursEvery(doc.recurs && doc.recurs.recurs ? doc.recurs.every : null)
      setRecursDuration(doc.recurs && doc.recurs.recurs ? doc.recurs.duration : null)
      getProjects()
    })
  }

  function getProjects() {
    db.find({
      selector: {
        type: "project",
      },
    })
    .then((result: object | null) => {
      if(result) {
        setProjects(result.docs)
        getAllTags()
        setLoaded(true)
      }
    }).catch((err: Error) => {
      console.log(err)
    })
  }

  async function getAllTags() {
    const result = await db.query('tags-ddoc/all-tags', {
      group: true
    })
    if(result.rows) {
      const tags = []
      result.rows.forEach(row => {
        tags.push(row.key)
      });
      setAllTags(tags)
    }
  }

  async function updateProjectTimestamps() {
    const timestamp = new Date().toISOString()
    if(task.project_id) {
      db.get(task.project_id).then(project => {
        db.put({
          ...project,
          timestamps: {
            ...project.timestamps,
            updated: timestamp
          }
        })
      })
    }
  }

  const updateTaskScheduledDate = async (e: IonDatetimeCustomEvent<DatetimeChangeEventDetail>) => {
    setScheduledDate(e.detail.value || ''); 
    const timestamp = new Date().toISOString()
    
    const response = await db.put({
      ...task,
      scheduled_date: e.detail.value || null,
      timestamps: {
        ...task.timestamps,
        updated: timestamp
      }
    })
    if(response.ok) {
      const newTask = await db.get(task._id, {latest: true})
      setTask(newTask)
      setScheduledDate(newTask.scheduled_date)
      updateProjectTimestamps()
    }
  }

  const updateTaskDueDate = async (e: IonDatetimeCustomEvent<DatetimeChangeEventDetail>) => {
    setDueDate(e.detail.value || ''); 
    const timestamp = new Date().toISOString()
    
    const response = await db.put({
      ...task,
      due_date: e.detail.value || null,
      timestamps: {
        ...task.timestamps,
        updated: timestamp
      }
    })
    if(response.ok) {
      const newTask = await db.get(task._id, {latest: true})
      setTask(newTask)
      setDueDate(newTask.due_date)
      updateProjectTimestamps()
    }
  }

  const updateTaskStatus = async (e: IonSelectCustomEvent<SelectChangeEventDetail>) => {
    setStatus(e.detail.value || 'Todo'); 
    const timestamp = new Date().toISOString()

    let newDueDate
    let newScheduledDate
    if(e.detail.value == 'Done' && recurs && recursEnabled) {
      if(recursDuration == 'day') {
        newDueDate = addDays(task.due_date, Number(recursEvery))
      } else if(recursDuration == 'hour') {
        newDueDate = addHours(task.due_date, Number(recursEvery))
      } else if(recursDuration == 'week') {
        newDueDate = addWeeks(task.due_date, Number(recursEvery))
      } else if(recursDuration == 'month') {
        newDueDate = addMonths(task.due_date, Number(recursEvery))
      } else if(recursDuration == 'year') {
        newDueDate = addYears(task.due_date, Number(recursEvery))
      }
    }
    if(e.detail.value == 'Done' && recurs && recursEnabled) {
      if(recursDuration == 'day') {
        newScheduledDate = addDays(task.scheduled_date, Number(recursEvery))
      } else if(recursDuration == 'hour') {
        newScheduledDate = addHours(task.scheduled_date, Number(recursEvery))
      } else if(recursDuration == 'week') {
        newScheduledDate = addWeeks(task.scheduled_date, Number(recursEvery))
      } else if(recursDuration == 'month') {
        newScheduledDate = addMonths(task.scheduled_date, Number(recursEvery))
      } else if(recursDuration == 'year') {
        newScheduledDate = addYears(task.scheduled_date, Number(recursEvery))
      }
    }

    const response = await db.put({
      ...task,
      status: e.detail.value == 'Done' && recurs && recursEnabled ? 'Next' : e.detail.value || 'Todo',
      due_date: e.detail.value == 'Done' && recurs && recursEnabled ? newDueDate : task.due_date,
      scheduled_date: e.detail.value == 'Done' && recurs && recursEnabled ? newScheduledDate : task.scheduled_date,
      timestamps: {
        ...task.timestamps,
        updated: timestamp,
        completed: e.detail.value == 'Done' ? timestamp : null
      }
    })
    if(response.ok) {
      const newTask = await db.get(task._id, {latest: true})
      setTask(newTask)
      setStatus(newTask.status)
      setDueDate(newTask.due_date)
      setScheduledDate(newTask.scheduled_date)
      updateProjectTimestamps()
      if(e.detail.value == 'Done' && recurs && recursEnabled) {
        presentSnackbar(`Rescheduled for ${formatRelative(newTask.due_date, new Date())}`, 3000)
      }
    }
  }

  const updateTaskDescription = async (description: string) => {
    setTask({...task, description: description})
    const timestamp = new Date().toISOString()
    
    const response = await db.put({
      ...task,
      description: description,
      timestamps: {
        ...task.timestamps,
        updated: timestamp,
      }
    })
    if(response.ok) {
      const newTask = await db.get(task._id, {latest: true})
      setTask(newTask)
      updateProjectTimestamps()
    }
  }

  const updateTaskTitle = async (title: string) => {
    setTask({...task, title: title})
    const timestamp = new Date().toISOString()
    
    const response = await db.put({
      ...task,
      title: title,
      timestamps: {
        ...task.timestamps,
        updated: timestamp,
      }
    })
    if(response.ok) {
      const newTask = await db.get(task._id, {latest: true})
      setTask(newTask)
      updateProjectTimestamps()
    }
  }

  const updateTaskSubtasks = async () => {
    const timestamp = new Date().toISOString()
    
    const newSubtask = {
      id: crypto.randomUUID(),
      title: subtaskInput.current?.value,
      order: subtasks.length + 1,
      complete: false
    }
    
    const newSubtasks = [...subtasks, newSubtask]
    
    if(subtaskInput.current?.value != "") {
      const response = await db.put({
        ...task,
        subtasks: newSubtasks,
        timestamps: {
          ...task.timestamps,
          updated: timestamp,
        }
      })
      if(response.ok) {
        subtaskInput.current.value = ''
        const newTask = await db.get(task._id, {latest: true})
        setTask(newTask)
        setSubtasks(newTask.subtasks)
        updateProjectTimestamps()
      }
    }
  }

  const toggleSubtask = async (e: IonCheckboxCustomEvent<CheckboxChangeEventDetail>, subtask: Object) => {
    const timestamp = new Date().toISOString()

    const newSubtask = {
      ...subtask,
      complete: e.target.checked
    }

    const newSubtasks = subtasks.map(s => {
      if(s.id == subtask.id) {
        return newSubtask
      } else {
        return s
      }
    })

    const response = await db.put({
      ...task,
      subtasks: newSubtasks,
      timestamps: {
        ...task.timestamps,
        updated: timestamp,
      }
    })
    if(response.ok) {
      const newTask = await db.get(task._id, {latest: true})
      setTask(newTask)
      setSubtasks(newTask.subtasks)
      updateProjectTimestamps()
    }
  }

  const updateTaskTags = async () => {

    async function getAllTags() {
      const result = await db.query('tags-ddoc/all-tags', {
        group: true
      })
      if(result.rows) {
        const tags = []
        result.rows.forEach(row => {
          tags.push(row.key)
        });
        setAllTags(tags)
      }
    }

    const timestamp = new Date().toISOString()

    const response = await db.put({
      ...task,
      tags: tags,
      timestamps: {
        ...task.timestamps,
        updated: timestamp
      }
    })
    if(response.ok) {
      const newTask = await db.get(task._id, {latest: true})
      setTask(newTask)
      setTags(newTask.tags)
      await getAllTags()
      updateProjectTimestamps()
    }
  }

  const moveTaskToProject = async () => {

    const timestamp = new Date().toISOString()

    db.put({
      ...task,
      project_id: selectedProject,
      timestamps: {
        ...task.timestamps,
        updated: timestamp
      }
    }).then((response) => {
      if(response.ok) {
        db.get(task._id, {latest: true}).then((response1) => {
          setTask(response1)
          db.get(selectedProject, {latest: true}).then((response2) => {
            let project = response2
            let newProject
            if(project.tasks) {
              newProject = {
                ...project,
                tasks: [...project.tasks, match.params.id],
                timestamps: {
                  ...project.timestamps,
                  updated: timestamp
                }
              }
            } else {
              newProject = {
                ...project,
                tasks: [match.params.id],
                timestamps: {
                  ...project.timestamps,
                  updated: timestamp
                }
              }
            }
            db.put(newProject).then((response3) => {})
          })
        })
      }
    })
  }

  const deleteTask = () => {
    db.remove(task).then(response => {
      if(response.ok) {
        updateProjectTimestamps()
        router.goBack()
      }
    })
  }

  const setRecurring = async (recursEvery: number, recursDuration: string) => {
    if(dueDate == null) {
      presentSnackbar({message: 'Please set a due date first', duration: 3000})
      setRecursEnabled(false)
      recursEveryInput.current!.value = null
      recursDurationSelect.current!.value = null
      return
    }
    let newRecurs = recurs
    newRecurs = {
      ...newRecurs,
      recurs: recursEnabled,
      every: recursEvery,
      duration: recursDuration
    }
    setRecurs(newRecurs)
    const timestamp = new Date().toISOString()
    
    const response = await db.put({
      ...task,
      recurs: newRecurs,
      timestamps: {
        ...task.timestamps,
        updated: timestamp,
      }
    })
    if(response.ok) {
      const newTask = await db.get(task._id, {latest: true})
      setTask(newTask)
      setRecurs(newTask.recurs ? newTask.recurs : null)
      setRecursEvery(newTask.recurs && newTask.recurs.recurs ? newTask.recurs.every : null)
      setRecursDuration(recursDurationSelect.current!.value = newTask.recurs && newTask.recurs.recurs ? newTask.recurs.duration : null)
      setRecursEnabled(newTask.recurs && newTask.recurs.recurs ? true : false)
      updateProjectTimestamps()
      presentSnackbar({message: newTask.recurs && newTask.recurs.recurs ? `Recurring enabled every ${newTask.recurs.every == 1 ? '' : newTask.recurs.every} ${newTask.recurs.duration}${newTask.recurs.every > 1 ? 's' : ''}` : 'Recurring disabled', duration: 3000})
    }
  }

  function onWillDismissTagPickerModal(ev: CustomEvent<OverlayEventDetail>) {
    updateTaskTags()
  }

  function onWillDissmissProjectPickerModal(ev: CustomEvent<OverlayEventDetail>) {
    if(ev.detail.role == 'move') {
      moveTaskToProject()
    }
  }

  function onWillDismissRecursModal(ev: CustomEvent<OverlayEventDetail>) {
    if(ev.detail.role == 'set') {
      setRecurring(ev.detail.data?.every, ev.detail.data?.duration)
    }
  }

  if(!loaded) {
    return (
      <IonPage>
        <IonHeader className='ion-no-border'>
          <IonToolbar>
            <IonButtons slot='start'>
              <IonBackButton defaultHref='/'></IonBackButton>
            </IonButtons>
            <IonButtons slot='end'>
              <IonButton id="openTaskActionsSheet">
                <IonIcon slot='icon-only' icon={ellipsisVerticalSharp}></IonIcon>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className='ion-padding'>
          <IonGrid>
            <IonRow className='ion-justify-content-center'>
              <IonCol size='auto'>
                <IonSpinner></IonSpinner>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonHeader className='ion-no-border'>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref='/'></IonBackButton>
          </IonButtons>
          <IonButtons slot='end'>
            <IonButton id="openTaskActionsSheet">
              <IonIcon slot='icon-only' icon={ellipsisVerticalSharp}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className='ion-padding'>
          <Title title={task.title} update={updateTaskTitle} />
          <Description description={task.description} update={updateTaskDescription} />
        </div>

        {
          subtasks.length > 0
          ? <IonList>
            <IonListHeader>Subtasks</IonListHeader>
            {
              subtasks.map(subtask => {
                return <IonItem>
                  <IonCheckbox legacy={true} labelPlacement="end" justify="start" onIonChange={(e) => toggleSubtask(e, subtask)} checked={subtask.complete}>{subtask.title}</IonCheckbox> 
                </IonItem>
              })
            }
          </IonList>
          : null
        }
        <div style={{padding: '0 16px'}}>
          <IonInput
            ref={subtaskInput}
            className='subtaskInput'
            label="Add Subtask"
            placeholder="Enter Subtask title"
            enterkeyhint="done"
            labelPlacement="floating"
            onIonChange={updateTaskSubtasks}
            autocapitalize='sentences'
            autoCorrect='on'
          ></IonInput>
        </div>

        <IonList>
          <IonListHeader>Meta</IonListHeader>
          <IonItem lines='inset'>
            <IonSelect value={status} onIonChange={e => {updateTaskStatus(e)}} label="Task status" labelPlacement="stacked">
              <IonSelectOption value="Todo">Todo</IonSelectOption>
              <IonSelectOption value="Next">Next</IonSelectOption>
              <IonSelectOption value="Waiting">Waiting</IonSelectOption>
              <IonSelectOption value="Done">Done</IonSelectOption>
              <IonSelectOption value="Cancelled">Cancelled</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem lines='inset' id='openschedulemodal'>
            <IonLabel>
              <p>Scheduled to start on</p>
              <div>{(scheduledDate) ? formatRelative(scheduledDate, new Date()) : 'Set start date'}</div>
            </IonLabel>
          </IonItem>
          <IonItem lines='inset' id='openduemodal'>
            <IonLabel>
              <p>Due</p>
              <div>{(dueDate) ? formatRelative(dueDate, new Date()) : 'Set due date'}</div>
            </IonLabel>
          </IonItem>
          {
            task.project_id
            ?  <IonItem lines='inset' routerLink={"/project/details/" + task.project_id}>
              <IonLabel>
                <p>Project</p>
                <div>{projects.find(p => p._id == task.project_id).title}</div>
              </IonLabel>
            </IonItem>
            : null
          }
          <IonItem lines='inset' id='openRecursModal'>
            <IonLabel>
              <p>Recurs</p>
              <div>
                {
                  recurs && recurs.recurs ?
                  `Every ${recurs.every == 1 ? '' : recurs.every} ${recurs.duration}${recurs.every > 1 ? 's' : ''}`
                  : `Task doesn't recur`
                }
              </div>
            </IonLabel>
          </IonItem>
          <IonItem lines='none' id='openTagPickerModal'>
            <IonLabel>
              <p>Tags</p>
              <IonRow>
                {
                  (tags.length > 0)
                  ? tags.map(tag => <IonChip key={tag}>{tag}</IonChip>)
                  : <IonText>Set tags</IonText>
                }
              </IonRow>
            </IonLabel>
          </IonItem>
        </IonList>

        <div style={{marginTop: 32, padding: '0 16px'}}>
          <small style={{display: 'block', marginBottom: 8, color: 'var(--ion-color-medium)'}}>
            Created: {task.timestamps ? formatDistance(task.timestamps.created, Date.now()) + ' ago' : ''}
          </small>
          <small style={{display: 'block', marginBottom: 8, color: 'var(--ion-color-medium)'}}>
            Updated: {task.timestamps ? formatDistance(task.timestamps.updated, Date.now()) + ' ago' : ''}
          </small>
          {
            (task.timestamps && task.timestamps.completed)
            ? <small style={{display: 'block', marginBottom: 8, color: 'var(--ion-color-medium)'}}>
              Completed: {(task.timestamps && task.timestamps.completed) ? formatDistance(task.timestamps.completed, Date.now()) + ' ago' : ''}
            </small>
            : null
          }
        </div>

        <IonActionSheet
          trigger='openTaskActionsSheet'
          header='Task actions'
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
                action: 'delete-task'
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
            } else if(detail.data?.action == 'delete-task') {
              deleteTaskConfirmation.current?.present()
            }
          }}
        ></IonActionSheet>

        <IonModal keepContentsMounted={true} trigger='openschedulemodal' className='datePickerModal'>
          <IonDatetime value={scheduledDate} onIonChange={(e: IonDatetimeCustomEvent<DatetimeChangeEventDetail>) => {updateTaskScheduledDate(e)}} showDefaultTitle={true} showDefaultButtons={true} showClearButton={true} presentation="date-time" minuteValues={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]} id="scheduleddatetime">
            <span slot="title">Select start date</span>
          </IonDatetime>
        </IonModal>
        <IonModal keepContentsMounted={true} trigger='openduemodal' className='datePickerModal'>
          <IonDatetime value={dueDate} onIonChange={(e: IonDatetimeCustomEvent<DatetimeChangeEventDetail>) => {updateTaskDueDate(e)}} showDefaultTitle={true} showDefaultButtons={true} showClearButton={true} presentation="date-time" minuteValues={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]} id="duedatetime">
            <span slot="title">Select due date</span>
          </IonDatetime>
        </IonModal>

        <IonModal
          ref={tagPickerModal}
          trigger="openTagPickerModal"
          onWillDismiss={(ev) => onWillDismissTagPickerModal(ev)}
          initialBreakpoint={0.35}
          breakpoints={[0, 0.35, 1]}
          // style={{
          //   bottom: isOpen ? keyboardHeight : 0
          // }}
        >
          <IonContent className='ion-padding'>
            <IonInput
              label="Add new Tag"
              placeholder='Tag name'
              labelPlacement="floating"
              fill="solid"
              mode="md"
              enterkeyhint='done'
              onIonChange={async (e) => {
                if(e.target.value) {
                  const newTag = [e.target.value]
                  setAllTags([...allTags, ...newTag])
                  setTags([...tags, ...newTag])
                  // await updateTaskTags()
                  e.target.value = ''
                }
              }}
              autocapitalize='sentences'
              autoCorrect='on'
            ></IonInput>
            <IonRow style={{margin: '12px 0 8px', alignItems: 'center', gap: 8}}>
              <IonIcon icon={pricetagsOutline}></IonIcon>
              <IonText color='medium'>Tags</IonText>
            </IonRow>
            <IonRow>
              {
                allTags.map(tag => <IonChip
                  key={tag}
                  onClick={async () => {
                    if(tags.find(t => t == tag)) {
                      setTags(tags.filter(t => t != tag))
                    } else {
                      setTags([...tags, tag])
                    }
                  }}
                >
                  {
                    (tags.find(t => t == tag))
                    ? <IonIcon icon={checkmark}></IonIcon>
                    : null
                  }
                  <IonLabel>{tag}</IonLabel>
                </IonChip>)
              }
            </IonRow>
          </IonContent>
        </IonModal>
        <IonModal ref={projectPickerModal} onWillDismiss={(ev) => onWillDissmissProjectPickerModal(ev)} initialBreakpoint={0.35} breakpoints={[0, 0.35, 1]}>
          <IonHeader className='ion-no-border'>
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
        <IonModal
          keepContentsMounted={true}
          ref={recursModal}
          trigger="openRecursModal"
          onWillDismiss={(ev) => onWillDismissRecursModal(ev)}
          className='smallEditModal'
        >
          <IonHeader className='ion-no-border'>
            <IonToolbar>
              <IonTitle>Recurs</IonTitle>
              <IonToggle checked={recursEnabled} onIonChange={e => {setRecursEnabled(e.detail.checked)}} style={{marginRight: 16}} slot='end'></IonToggle>
            </IonToolbar>
          </IonHeader>
          <IonContent className='ion-padding'>
            <IonInput value={recursEvery} ref={recursEveryInput} onIonChange={e => {setRecursEvery(Number(e.detail?.value))}} type='number' label='Recurs every' placeholder='1' fill='solid' style={{textAlign: 'right'}}></IonInput>
            <IonSelect value={recursDuration} ref={recursDurationSelect} onIonChange={e => {setRecursDuration(e.detail?.value)}} interface='popover' label='Duration' placeholder='Day' fill='solid' style={{marginTop: 8}}>
              <IonSelectOption value="hour">Hour{recursEvery && recursEvery > 1 ? 's' : ''}</IonSelectOption>
              <IonSelectOption value="day">Day{recursEvery && recursEvery > 1 ? 's' : ''}</IonSelectOption>
              <IonSelectOption value="week">Week{recursEvery && recursEvery > 1 ? 's' : ''}</IonSelectOption>
              <IonSelectOption value="month">Month{recursEvery && recursEvery > 1 ? 's' : ''}</IonSelectOption>
              <IonSelectOption value="year">Year{recursEvery && recursEvery > 1 ? 's' : ''}</IonSelectOption>
            </IonSelect>
          </IonContent>
          <IonFooter className='ion-no-border'>
            <div style={{display: 'flex', justifyContent: 'end'}}>
              <IonButton fill='clear' onClick={() => recursModal.current?.dismiss(null, 'dismiss')}>Cancel</IonButton>
              <IonButton fill='clear' onClick={() => recursModal.current?.dismiss({every: recursEveryInput.current?.value, duration: recursDurationSelect.current?.value}, 'set')}>Set</IonButton>
            </div>
          </IonFooter>
        </IonModal>
        <IonAlert
          ref={deleteTaskConfirmation}
          header="Delete Task?"
          message="This will permanently remove the task. Do you wish to continue?"
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
              deleteTask()
            }
          }}
        ></IonAlert>
      </IonContent>
    </IonPage>
  )
}

export default TaskDetails