// import _ from "lodash";
import {
  FETCH_INVOICES_BY_ITEM,
  FETCH_INVOICES_BY_ITEM_SUCCESS,
  FETCH_INVOICES_GL,
  FETCH_INVOICES_GL_SUCCESS,
  FETCH_ITEM_GL,
  FETCH_ITEM_GL_SUCCESS,
  FETCH_ITEM_INV_LOC,
  FETCH_ITEM_INV_LOC_SUCCESS,
  FETCH_TREND_UNIT_GROUP_BY_GL,
  FETCH_TREND_UNIT_GROUP_BY_GL_SUCCESS,
  SELECT_ALL_GL_FILTERS,
  SELECT_ALL_ITEMS,
  SET_GL_FILTERS,
  SET_ITEMS_USAGE_DISPLAY,
  SWITCH_CHART_TYPE,
  SWITCH_TO_SINGLE_GL,
  UPDATE_GL_FILTERS,
  UPDATE_ITEM_TID,
} from 'actions/types'
import { calculateUsage } from 'utils'

const INITIAL_STATE = {
  cost_trend_unit_group_by_gl: [],
  item_inventory_level_by_location: [],
  cost_of_goods_gl_invoices: [],
  item_level_trend: [],
  prev_item_level_trend: [],
  glFilters: [],
  glFilterSelectAll: true,
  currentGL: {},
  itemsTid: [],
  items_select_all: true,
  invoicesGL: '',
  currentCogsItemGL: '',
  currentCogsItemGLCode: '',
  cogsAcrossUnitChartType: 'pie',
  currentItemTid: {},
  isLoading: false,
  invoices_by_item: [],
  itemId: undefined,
  cogsItemUsageDisplay: 'chart',
}

const without = (arr, ...args) => arr.filter((item) => !args.includes(item))
export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case FETCH_TREND_UNIT_GROUP_BY_GL: {
      return { ...state, isLoading: true }
    }
    case FETCH_TREND_UNIT_GROUP_BY_GL_SUCCESS: {
      return {
        ...state,
        cost_trend_unit_group_by_gl: action.payload,
        glFilterSelectAll: true,
        isLoading: false,
      }
    }
    case SET_GL_FILTERS: {
      return { ...state, glFilters: action.glFilters }
    }
    case SELECT_ALL_GL_FILTERS: {
      //   const glCodes = _.uniq(
      //     _.compact(_.map(state.cost_trend_unit_group_by_gl, "gl_code"))
      //   );
      const glCodes = state.cost_trend_unit_group_by_gl
        .map((x) => x.gl_code)
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
      let newGlFilters = []
      if (action.isChecked) {
        newGlFilters = glCodes
      }
      return {
        ...state,
        glFilterSelectAll: action.isChecked,
        glFilters: newGlFilters,
      }
    }
    case UPDATE_GL_FILTERS: {
      let newGLFilters = [...state.glFilters]
      if (action.isChecked) {
        newGLFilters.push(action.glFilter)
      } else {
        // newGLFilters = _.without(newGLFilters, action.glFilter);
        newGLFilters = without(newGLFilters, action.glFilter)
      }
      // newGLFilters = _.compact(newGLFilters);
      newGLFilters = newGLFilters.filter((x) => !!x)
      return {
        ...state,
        glFilterSelectAll: false,
        glFilters: newGLFilters,
        currentGL: {
          gl_code: action.glFilter,
          display: action.isChecked,
        },
      }
    }
    case FETCH_ITEM_GL: {
      return {
        ...state,
        item_level_trend: [],
        currentCogsItemGLCode: action.glCode,
        currentCogsItemGL: action.glName,
        isLoading: true,
        prev_item_level_trend: state.item_level_trend,
      }
    }
    case FETCH_ITEM_GL_SUCCESS: {
      const { payload } = action
      let topFiveUsage = payload.map((d, idx) => {
        const { beg_inv, purchases, end_inv } = d
        const usage = calculateUsage(beg_inv, purchases, end_inv)

        return {
          ...d,
          usage,
          t_id: [...d.item_name.split(' '), idx].join('_').toLocaleLowerCase(),
        }
      })
      //   topFiveUsage = _.sortBy(topFiveUsage, "usage")
      //     .reverse()
      //     .slice(0, 5)
      //     .map((item) => item.t_id);
      topFiveUsage = topFiveUsage
        .sort((x, y) => x.usage - y.usage)
        .reverse()
        .slice(0, 5)
        .map((item) => item.t_id)

      const item_level_trend_map = payload.map((d, idx) => {
        const t_id = [...d.item_name.split(' '), idx]
          .join('_')
          .toLocaleLowerCase()
        let shouldDisplay
        if (action.updateDataOnly) {
          //   const prevItem = _.find(state.prev_item_level_trend, {
          //     t_id: t_id,
          //   });
          const prevItem = state.prev_item_level_trend.find(
            (x) => x.t_id === t_id,
          )
          if (prevItem) {
            shouldDisplay = prevItem.display
          }
        } else {
          shouldDisplay = topFiveUsage.includes(t_id)
        }

        return {
          ...d,
          display: shouldDisplay,
          t_id,
          showInLegend: shouldDisplay,
        }
      })
      const itemSelectAll =
        item_level_trend_map.length > 0 && item_level_trend_map.length <= 5
      return {
        ...state,
        item_level_trend: item_level_trend_map,
        isLoading: false,
        items_select_all: itemSelectAll,
      }
    }
    case SELECT_ALL_ITEMS: {
      let newItemLevelTrend = state.item_level_trend
      newItemLevelTrend = newItemLevelTrend.map((d) => {
        if (action.isChecked) {
          return { ...d, display: true, showInLegend: true }
        }
        return { ...d, display: false, showInLegend: false }
      })
      return {
        ...state,
        item_level_trend: newItemLevelTrend,
        items_select_all: action.isChecked,
      }
    }
    case SWITCH_TO_SINGLE_GL: {
      return {
        ...state,
        glFilters: [action.glName],
        cogsAcrossUnitChartType: 'trend',
        glFilterSelectAll: false,
      }
    }
    case SWITCH_CHART_TYPE: {
      return { ...state, cogsAcrossUnitChartType: action.chartType }
    }
    case FETCH_ITEM_INV_LOC: {
      return {
        ...state,
        item_inventory_level_by_location: [],
        isLoading: true,
      }
    }
    case FETCH_ITEM_INV_LOC_SUCCESS: {
      return {
        ...state,
        item_inventory_level_by_location: action.payload,
        isLoading: false,
      }
    }
    case FETCH_INVOICES_GL: {
      return { ...state, isLoading: true, invoicesGL: action.glCode }
    }
    case FETCH_INVOICES_GL_SUCCESS: {
      return {
        ...state,
        cost_of_goods_gl_invoices: action.payload,
        isLoading: false,
      }
    }
    case UPDATE_ITEM_TID: {
      const newItemLevelTrend = [...state.item_level_trend].map((d) => {
        if (d.t_id === action.itemTid) {
          d.display = action.isChecked
        }
        return d
      })
      return {
        ...state,
        currentItemTid: {
          tid: action.itemTid,
          display: action.isChecked,
        },
        item_level_trend: newItemLevelTrend,
        items_select_all: false,
      }
    }
    case FETCH_INVOICES_BY_ITEM: {
      return {
        ...state,
        invoices_by_item: [],
        isLoading: true,
        itemId: action.params.itemId,
      }
    }
    case FETCH_INVOICES_BY_ITEM_SUCCESS: {
      return { ...state, invoices_by_item: action.payload, isLoading: false }
    }
    case SET_ITEMS_USAGE_DISPLAY: {
      return { ...state, cogsItemUsageDisplay: action.displayType }
    }
    default: {
      return { ...state }
    }
  }
}
