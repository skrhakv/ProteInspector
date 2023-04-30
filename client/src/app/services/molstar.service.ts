import { Injectable } from '@angular/core';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { PluginCommands } from 'molstar/lib/mol-plugin/commands';

@Injectable({
  providedIn: 'root'
})
export class MolstarService {

  constructor() { }

  public async cameraReset(plugin: PluginUIContext) {
    await new Promise(res => requestAnimationFrame(res));
    PluginCommands.Camera.Reset(plugin);
}
}
