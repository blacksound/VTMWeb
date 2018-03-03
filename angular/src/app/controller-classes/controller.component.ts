import { Controller } from './controller'

export interface ControllerComponent {
  controller: Controller;
  update(controller: Controller);
}
