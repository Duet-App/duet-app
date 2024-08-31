import { IonBackButton, IonButton, IonButtons, IonCheckbox, IonChip, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonPage, IonRow, IonSkeletonText, IonSpinner, IonText, IonTitle, IonToolbar, useIonViewDidEnter } from "@ionic/react"
import { add, checkmark, filterOutline, pricetagsOutline } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import { useHistory } from "react-router";
import TaskItem from "../components/Tasks/TaskItem";
import TasksSkeletonLoader from "../components/TasksSkeletonLoader";

const Actionable: React.FC = () => {

  const db = new PouchDB('duet');
  PouchDB.plugin(PouchFind)

  async function getActionableTasks() {
    db.find({
      selector: {
        type: "task",
        status: "Next",
        "timestamps.created": {
          "$gt": null
        },
      },
      sort: [{'timestamps.created': 'desc'}]
    }).then(result => {
      setActionableTasks(result.docs)
      getAllTags()
      getProjects()
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

  function getProjects() {
    db.find({
      selector: {
        type: "project",
      },
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

  useIonViewDidEnter(() => {
    getActionableTasks()
  }, [])

  const [actionableTasks, setActionableTasks] = useState([])
  const [allTags, setAllTags] = useState([])
  const [filterTags, setFilterTags] = useState([])
  const [filteredActionableTasks, setFilteredActionableTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loaded, setLoaded] = useState(false)

  const history = useHistory()

  const filterBottomSheet = useRef<HTMLIonModalElement>(null)

  useEffect(() => {
    if(filterTags.length > 0) {
      filterActionableTasks()
    } else {
      setFilteredActionableTasks(actionableTasks)
    }
  }, [filterTags, actionableTasks])

  const filterActionableTasks = async () => {
    let tasks = actionableTasks
    tasks = tasks.filter(task => task.tags)
    for(var i = 0; i < filterTags.length; i++) {
      tasks = tasks.filter(task => task.tags.filter(tag => tag == filterTags[i]).length > 0)
    }
    setFilteredActionableTasks(tasks)
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref="/"></IonBackButton>
          </IonButtons>
          <IonTitle>Actionable</IonTitle>
          <IonButtons slot='end'>
            <IonButton id="openFilterBottomSheet">
              <IonIcon slot="icon-only" icon={filterOutline}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {
          !loaded
          ? <TasksSkeletonLoader />
          : actionableTasks.length == 0
          ? <div className="ion-padding"><IonText color='medium'>No actionable tasks. Add new tasks using the blue button below.</IonText></div>
          : <IonList>
            {
              filteredActionableTasks.map(task => {
                return (
                  <TaskItem key={task._id} task={task} updateFn={getActionableTasks} project={task.project_id ? projects.find(p => p._id == task.project_id) : null} />
                )
              })
            }
          </IonList>
        }

        <IonFab slot='fixed' vertical='bottom' horizontal='end'>
          <IonFabButton routerLink="/add-task">
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>

        <IonModal ref={filterBottomSheet} trigger="openFilterBottomSheet" initialBreakpoint={0.35} breakpoints={[0, 0.35, 1]}>
          <IonContent className="ion-padding">
            <IonRow style={{marginBottom: 12, alignItems: 'center', gap: 8}}>
              <IonIcon color="medium" icon={pricetagsOutline}></IonIcon>
              <IonText color='medium'>Filter by tags</IonText>
            </IonRow>
            <IonRow>
              {
                allTags.map(tag => {
                  return <IonChip 
                    key={tag}
                    onClick={() => {
                      if(filterTags.find(t => t == tag)) {
                        setFilterTags(filterTags.filter(t => t != tag))
                      } else {
                        setFilterTags([...filterTags, tag])
                      }
                    }}
                  >
                    {
                      (filterTags.find(t => t == tag))
                      ? <IonIcon icon={checkmark}></IonIcon>
                      : null
                    }
                    <IonLabel>{tag}</IonLabel>
                  </IonChip>
                })
              }
            </IonRow>
            <IonRow style={{marginTop: 12}}>
              <IonCol>
                <IonButton expand="block" color="tertiary" style={{gap: 8}} onClick={(e) => {
                  e.preventDefault()
                  filterBottomSheet.current?.dismiss()
                  history.push('/tags')
                }}>
                  <IonIcon slot="start" icon={pricetagsOutline}></IonIcon>
                  Manage Tags
                </IonButton>
              </IonCol>
            </IonRow>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  )
}

export default Actionable