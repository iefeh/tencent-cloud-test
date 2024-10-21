import { useState, useEffect } from "react";
import { GyozaTabsEnum } from './GyozaTabs'


const useDataHook = (key: `${GyozaTabsEnum}`) => {
  const [overviewList, setOverviewList] = useState([1, 2, 23, 23, 23, 23, 23]);
  const [tasksList, setTasksList] = useState([1, 2, 23, 23, 23, 23]);
  const [rankingList, setRankingList] = useState([1, 2, 23, 23, 23, 23]);

  const fetchOverviewData = async () => {

  }

  const getTasks = async () => {

  }

  const getRanking = async () => { }


  const getData = async () => {
    switch (key) {
      case GyozaTabsEnum.Overview:
        await fetchOverviewData()
        break;

      case GyozaTabsEnum.Tasks:
        await getTasks()
        break;

      case GyozaTabsEnum.Ranking:
        await getRanking()

      default:
        break;
    }
  }

  useEffect(() => {
    getData()
  }, [key])


  return { overviewList, tasksList, rankingList }
}

export default useDataHook;