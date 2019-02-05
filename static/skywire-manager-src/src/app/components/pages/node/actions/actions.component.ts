import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NodeService } from '../../../../services/node.service';
import { Node, NodeInfo } from '../../../../app.datatypes';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ConfigurationComponent } from './configuration/configuration.component';
import { TerminalComponent } from './terminal/terminal.component';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {UpdateNodeComponent} from './update-node/update-node.component';
import { environment } from '../../../../../environments/environment';
import { ButtonComponent } from '../../../layout/button/button.component';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss']
})
export class ActionsComponent implements OnInit {
  @Input() node: Node;
  @Input() nodeInfo: NodeInfo;
  @ViewChild('updateButton') updateButton: ButtonComponent;

  constructor(
    private nodeService: NodeService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    if (environment.production) {
      this.updateButton.loading();

      this.nodeService.checkUpdate().subscribe(hasUpdate => {
        this.updateButton.reset();
        this.updateButton.notify(hasUpdate);
      });
    }
  }

  reboot() {
    this.nodeService.reboot().subscribe(
      () => {
        this.translate.get('actions.config.success').subscribe(str => {
          this.snackbar.open(str);
          this.router.navigate(['nodes']);
        });
      },
      (e) => this.snackbar.open(e.message),
    );
  }

  update() {
    this.dialog.open(UpdateNodeComponent).afterClosed().subscribe((updated) => {
      if (updated) {
        this.snackbar.open(this.translate.instant('actions.update.update-success'), undefined, {
          duration: 10000,
        });
      }
    });
  }

  configuration() {
    this.dialog.open(ConfigurationComponent, {
      data: {
        node: this.node,
        discoveries: this.nodeInfo.discoveries,
      },
      width: '800px'
    });
  }

  terminal() {
    this.dialog.open(TerminalComponent, {
      width: '1000px',
      data: {
        addr: this.node.addr,
      }
    });
  }

  back() {
    this.router.navigate(['nodes']);
  }
}
