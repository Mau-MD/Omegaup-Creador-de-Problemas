import { action, Action, Computed, computed } from "easy-peasy";
import { uuid } from "uuidv4";

export interface IGroup {
  groupId: string;
  name: string;
  points: number;
  defined: boolean;
  cases: ICase[];
}

export interface ICase {
  caseId: string;
  name: string;
  groupId: string;
  points: number;
  defined: boolean;
}

interface caseIndentifier {
  groupId: string;
  caseId: string;
}

export interface ICasesModel {
  data: IGroup[];
  selected: caseIndentifier;

  addGroup: Action<ICasesModel, IGroup>;
  editGroup: Action<ICasesModel, IGroup>;
  removeGroup: Action<ICasesModel, string>;

  addCase: Action<ICasesModel, ICase>;
  editCase: Action<ICasesModel, { case: ICase; lastId: string }>;
  removeCase: Action<ICasesModel, caseIndentifier>;

  setSelected: Action<ICasesModel, caseIndentifier>;
}

function calculatePoints(state: IGroup[]) {
  let maxPoints = 100;
  let notDefinedCount = 0;

  state.forEach((element) => {
    if (element.name === "Sin Grupo") {
      element.cases.forEach((caseElement) => {
        if (caseElement.defined) {
          maxPoints -= caseElement.points ? caseElement.points : 0;
        } else {
          notDefinedCount++;
        }
      });
    } else {
      if (element.defined) {
        maxPoints -= element.points ? element.points : 0;
      } else {
        notDefinedCount++;
      }
    }
  });

  let individualPoints = maxPoints / notDefinedCount;

  state = state.map((element) => {
    if (element.name === "Sin Grupo") {
      element.cases = element.cases.map((caseElement) => {
        if (!caseElement.defined) {
          caseElement.points = individualPoints;
        }
        return caseElement;
      });
    }
    if (!element.defined) {
      element.points = individualPoints;
    }
    return element;
  });

  return state;
}

const CasesModel = {
  data: [
    {
      groupId: uuid(),
      name: "Sin Grupo",
      cases: [],
      defined: false,
      points: 0,
    },
  ],
  selected: {
    groupId: "none",
    caseId: "none",
  },
  addGroup: action((state, payload) => {
    state.data.push(payload);
    state.data = calculatePoints(state.data);
  }),
  editGroup: action((state, payload) => {
    state.data = state.data.map((element) => {
      if (element.groupId === payload.groupId) {
        element = payload;
      }
      return element;
    });
    state.data = calculatePoints(state.data);
  }),
  removeGroup: action((state, payload) => {
    state.data = state.data.filter((element) => {
      return element.groupId !== payload;
    });
    state.data = calculatePoints(state.data);
  }),
  addCase: action((state, payload) => {
    state.data.map((element) => {
      if (element.groupId === payload.groupId) {
        element.cases.push(payload);
      }
      return element;
    });
    state.data = calculatePoints(state.data);
  }),
  editCase: action((state, payload) => {
    const { case: caseData, lastId } = payload;

    const group = state.data.find(
      (groupElement) => groupElement.groupId === lastId
    );

    if (lastId !== caseData.groupId) {
      if (group) {
        group.cases = group.cases.filter(
          (caseElement) => caseElement.caseId !== caseData.caseId
        );
      }

      const newGroup = state.data.find(
        (groupElement) => groupElement.groupId === caseData.groupId
      );

      newGroup?.cases.push(caseData);
      return;
    }

    const caseIndex = group?.cases.findIndex(
      (caseElement) => caseElement.caseId === caseData.caseId
    );

    if (group !== undefined && caseIndex !== undefined) {
      group.cases[caseIndex] = caseData;
    }
  }),
  removeCase: action((state, payload) => {
    state.data.map((element) => {
      if (element.groupId === payload.groupId) {
        element.cases = element.cases.filter((caseElement) => {
          return caseElement.caseId !== payload.caseId;
        });
      }
      return element;
    });
    state.data = calculatePoints(state.data);
  }),
  setSelected: action((state, payload) => {
    state.selected = payload;
  }),
} as ICasesModel;

export default CasesModel;
