import { IonBackButton, IonButton, IonButtons, IonCheckbox, IonChip, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonPage, IonRow, IonSkeletonText, IonSpinner, IonText, IonTitle, IonToolbar, useIonViewDidEnter } from "@ionic/react"
import { add, checkmark, filterOutline, pricetagsOutline } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"
import { endOfToday, formatISO, startOfToday } from "date-fns";
import { useHistory } from "react-router";
import TaskItem from "../components/Tasks/TaskItem";
import TasksSkeletonLoader from "../components/TasksSkeletonLoader";

const Today: React.FC = () => {

  const db = new PouchDB('duet');
  PouchDB.plugin(PouchFind)

  async function getTodaysTasks() {
    db.find({
      selector: {
        type: "task",
        "$and": [
          {
            "scheduled_date": {
              "$gte": formatISO(startOfToday())
            },
          },
          {
            "scheduled_date": {
              "$lte": formatISO(endOfToday())
            },
          },
          {
            status: "Next",
          }
        ],
      },
      sort: [{'scheduled_date': 'asc'}]
    }).then(result => {
      setTodaysTasks(result.docs)
      getOverdueTasks()
      getAllTags()
      getProjects()
    })
  }

  async function getOverdueTasks() {
    const result = await db.find({
      selector: {
        type: "task",
        status: "Next",
        "scheduled_date": {
          "$lt": formatISO(startOfToday())
        },
      },
      sort: [{'scheduled_date': 'asc'}]
    })
    setOverdueTasks(result.docs)
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

  useIonViewDidEnter(() => {
    getTodaysTasks()
  }, [])

  const [todaysTasks, setTodaysTasks] = useState([])
  const [overdueTasks, setOverdueTasks] = useState([])
  const [allTags, setAllTags] = useState([])
  const [filterTags, setFilterTags] = useState([])
  const [filteredTodaysTasks, setFilteredTodaysTasks] = useState([])
  const [filteredOverdueTasks, setFilteredOverdueTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loaded, setLoaded] = useState(false)

  const history = useHistory()

  const filterBottomSheet = useRef<HTMLIonModalElement>(null)

  useEffect(() => {
    if(filterTags.length > 0) {
      filterOverdueTasks()
      filterTodaysTasks()
    } else {
      setFilteredOverdueTasks(overdueTasks)
      setFilteredTodaysTasks(todaysTasks)
    }
  }, [filterTags, overdueTasks, todaysTasks])

  const filterTodaysTasks = async () => {
    let tasks = todaysTasks
    tasks = tasks.filter(task => task.tags)
    for(var i = 0; i < filterTags.length; i++) {
      tasks = tasks.filter(task => task.tags.filter(tag => tag == filterTags[i]).length > 0)
    }
    setFilteredTodaysTasks(tasks)
  }

  const filterOverdueTasks = async () => {
    let tasks = overdueTasks
    tasks = tasks.filter(task => task.tags)
    for(var i = 0; i < filterTags.length; i++) {
      tasks = tasks.filter(task => task.tags.filter(tag => tag == filterTags[i]).length > 0)
    }
    setFilteredOverdueTasks(tasks)
  }

  // if(!loaded) {
  //   return (
  //     <IonPage>
  //       <IonHeader>
  //         <IonToolbar>
  //           <IonButtons slot='start'>
  //             <IonBackButton defaultHref="/"></IonBackButton>
  //           </IonButtons>
  //           <IonTitle>Today</IonTitle>
  //           <IonButtons slot='end'>
  //             <IonButton id="openFilterBottomSheet">
  //               <IonIcon slot="icon-only" icon={filterOutline}></IonIcon>
  //             </IonButton>
  //           </IonButtons>
  //         </IonToolbar>
  //       </IonHeader>
  //       <IonContent fullscreen className='ion-padding'>
  //         <IonHeader collapse='condense'>
  //           <IonToolbar>
  //             <IonTitle size='large'>
  //               <IonSkeletonText animated={true}></IonSkeletonText>
  //             </IonTitle>
  //           </IonToolbar>
  //         </IonHeader>
  //         <IonList>
  //           <IonItem>
  //             <IonIcon slot="start">
  //               <IonSkeletonText animated={true} style={{borderRadius: '50%'}}></IonSkeletonText>
  //             </IonIcon>
  //             <IonLabel>
  //               <IonSkeletonText animated={true}></IonSkeletonText>
  //             </IonLabel>
  //           </IonItem>
  //           <IonItem>
  //             <IonIcon slot="start">
  //               <IonSkeletonText animated={true} style={{borderRadius: '50%'}}></IonSkeletonText>
  //             </IonIcon>
  //             <IonLabel>
  //               <IonSkeletonText animated={true}></IonSkeletonText>
  //             </IonLabel>
  //           </IonItem>
  //           <IonItem>
  //             <IonIcon slot="start">
  //               <IonSkeletonText animated={true} style={{borderRadius: '50%'}}></IonSkeletonText>
  //             </IonIcon>
  //             <IonLabel>
  //               <IonSkeletonText animated={true}></IonSkeletonText>
  //             </IonLabel>
  //           </IonItem>
  //         </IonList>
  //       </IonContent>
  //     </IonPage>
  //   )
  // }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref="/"></IonBackButton>
          </IonButtons>
          <IonTitle>Today</IonTitle>
          <IonButtons slot='end'>
            <IonButton id="openFilterBottomSheet">
              <IonIcon slot="icon-only" icon={filterOutline}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse='condense'>
          <IonToolbar>
            <IonTitle size='large'>Today</IonTitle>
          </IonToolbar>
        </IonHeader>
        {
          filteredOverdueTasks.length > 0
          ? <IonList style={{marginBottom: 24}}>
            <IonListHeader>
              <IonLabel>Overdue</IonLabel>
            </IonListHeader>
            {
              filteredOverdueTasks.map(task => {
                return (
                  <TaskItem key={task._id} task={task} updateFn={getTodaysTasks} project={task.project_id ? projects.find(p => p._id == task.project_id) : null} />
                )
              })
            }
          </IonList>
          : null
        } 
        {
          !loaded
          ? <TasksSkeletonLoader />
          : todaysTasks.length == 0
          ? <div className="ion-padding"><IonText color='medium'>No tasks for today. Add new tasks using the blue button below.</IonText></div>
          : <IonList>
            {
              filteredTodaysTasks.map(task => {
                return (
                  <TaskItem key={task._id} task={task} updateFn={getTodaysTasks} project={task.project_id ? projects.find(p => p._id == task.project_id) : null} />
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

export default Today