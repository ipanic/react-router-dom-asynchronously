import { observer } from 'mobx-react-lite';
import { ComponentType, CSSProperties, PropsWithChildren, useEffect, useState } from 'react';
import { __RouterContext as RouterContext, RouteProps, useHistory } from 'react-router';
import { IDeclaredRoute } from '../helpers/model';
import { RoutingProvider, useRoutingContext } from '../providers';
import { AsyncSwitchState } from './async-switch.store';

export interface AsyncSwitchProps<TContext> extends RouteProps {
  routes: IDeclaredRoute<TContext>[];
  context: TContext;
  displayName?: string;
  wrapper?: ComponentType<PropsWithChildren<{ style?: CSSProperties }>>
}

const HIDE_STYLES: CSSProperties = {
  width: 0,
  height: 0,
  pointerEvents: 'none',
  visibility: 'hidden',
  userSelect: 'none',
  position: 'fixed',
  left: -1,
  top: -1
}

function AsyncSwitchComponent<TContext>(props: AsyncSwitchProps<TContext>) {
  let history = useHistory();
  let parent = useRoutingContext();

  let { context, displayName, routes } = props;
  let [state] = useState(() => new AsyncSwitchState(routes, parent, history, context, displayName));

  useEffect(() => () => state.destroy(), [state]);
  useEffect(() => state.syncParent(parent), [parent]);
  useEffect(() => state.syncProps(props), [state, props.routes, props.context]);

  return <>
    {state.committedState && <RoutingProvider value={state.committedContext} key={state.committedState.match.path}>
      <RouterContext.Provider value={state.committedState}>
        {props.wrapper
          ? <props.wrapper>
            <state.committedState.component/>
          </props.wrapper>
          : <state.committedState.component/>}
      </RouterContext.Provider>
    </RoutingProvider>}
    {state.pendingState && !state.pendingEqualCommitted && <RoutingProvider value={state.pendingContext} key={state.pendingState.match.path}>
      <RouterContext.Provider value={state.pendingState}>
        {props.wrapper
          ? <props.wrapper style={HIDE_STYLES}>
            <state.pendingState.component style={HIDE_STYLES}/>
          </props.wrapper>
          : <state.pendingState.component style={HIDE_STYLES}/>}
      </RouterContext.Provider>
    </RoutingProvider>}
  </>;
}

export const AsyncSwitch = observer(AsyncSwitchComponent);
