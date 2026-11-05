import { defineRouter } from '#q-app';
import { routes, handleHotUpdate } from 'vue-router/auto-routes';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router';
import StudentLayout from '@/layouts/StudentLayout.vue';
import TeacherLayout from '@/layouts/TeacherLayout.vue';
import { useAuthStore } from '@/stores/auth-store';

function withDashboardLayouts(autoRoutes: RouteRecordRaw[]): RouteRecordRaw[] {
  const groupedStudentRoute = autoRoutes.find(
    (route) => route.path === '/student' && 'children' in route,
  );
  const groupedTeacherRoute = autoRoutes.find(
    (route) => route.path === '/teacher' && 'children' in route,
  );

  const appRoutes = autoRoutes
    .filter((route) => {
      if (groupedStudentRoute && route.path.startsWith('/student/')) {
        return false;
      }

      if (groupedTeacherRoute && route.path.startsWith('/teacher/')) {
        return false;
      }

      return true;
    })
    .map((route) => {
      if (route === groupedStudentRoute) {
        return {
          path: route.path,
          component: StudentLayout,
          redirect: '/student/panel',
          children: route.children ?? [],
        };
      }

      if (route === groupedTeacherRoute) {
        return {
          path: route.path,
          component: TeacherLayout,
          redirect: '/teacher/panel',
          children: route.children ?? [],
        };
      }

      return route;
    });

  const flatStudentRoutes = autoRoutes
    .filter((route) => route.path.startsWith('/student/'))
    .map((route) => ({ ...route, path: route.path.slice('/student/'.length) }));
  const flatTeacherRoutes = autoRoutes
    .filter((route) => route.path.startsWith('/teacher/'))
    .map((route) => ({ ...route, path: route.path.slice('/teacher/'.length) }));

  if (!groupedStudentRoute && flatStudentRoutes.length > 0) {
    appRoutes.push({
      path: '/student',
      component: StudentLayout,
      redirect: '/student/panel',
      children: flatStudentRoutes,
    });
  }

  if (!groupedTeacherRoute && flatTeacherRoutes.length > 0) {
    appRoutes.push({
      path: '/teacher',
      component: TeacherLayout,
      redirect: '/teacher/panel',
      children: flatTeacherRoutes,
    });
  }

  return appRoutes;
}

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(() => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes: withDashboardLayouts(routes),

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  });

  Router.beforeEach((to) => {
    if (to.path === '/student' || to.path.startsWith('/student/')) {
      const authStore = useAuthStore();
      if (authStore.currentUser?.profileType !== 'student') {
        return { path: '/' };
      }
    } else if (to.path === '/teacher' || to.path.startsWith('/teacher/')) {
      const authStore = useAuthStore();
      if (authStore.currentUser?.profileType !== 'teacher') {
        return { path: '/' };
      }
    }

    return true;
  });

  // enable HMR for it
  if (import.meta.hot) {
    handleHotUpdate(Router, (updatedRoutes) => {
      Router.clearRoutes();
      withDashboardLayouts(updatedRoutes).forEach((route) => Router.addRoute(route));
    });
  }

  return Router;
});
