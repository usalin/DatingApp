import { Component, OnInit } from '@angular/core';
import { Message } from '../_models/message';
import { Pagination, PaginatedResult } from '../_models/pagination';
import { UserService } from '../_services/user.service';
import { AuthService } from '../_services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service.ts.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {


messages: Message[];
messageID: number;



pagination: Pagination;
messageContainer = 'Unread';




constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private alertify: AlertifyService
  ) {}

ngOnInit() {
    this.route.data.subscribe(data => {

       // PaginatedResult[Messages]
      this.messages = data[`messages`].result;
      this.pagination = data[`messages`].pagination;
    });


  }

loadMessages(messageId?: number) {
    this.userService
      .getMessages(
        this.authService.decodedToken.nameid,
        this.pagination.currentPage,
        this.pagination.itemsPerPage,
        this.messageContainer,
        messageId
      )
      .subscribe(
        (res: PaginatedResult<Message[]>) => {

          this.messages = res.result;
          this.pagination = res.pagination;
        },
        error => {
          this.alertify.error(error);
        }
      );
  }

deleteMessage(id: number) {
    this.alertify.confirm(
      'Are you sure you want to delete this message?',
      () => {
        this.userService
          .deleteMessage(id, this.authService.decodedToken.nameid)
          .subscribe(
            () => {
              this.messages.splice(
                this.messages.findIndex(m => m.id === id),
                1
              );
              this.alertify.success('Message has been deleted');
            },
            error => {
              this.alertify.error('Failed to delete the message');
            }
          );
      }
    );
  }

  markMessage(id: number) {

    this.alertify.confirm(
      'Are you sure you want to mark this message as read??',
      () => {
        this.userService
          .markAsRead(id, this.authService.decodedToken.nameid)
          .subscribe(
            () => {

                // const itemIndex = this.messages.findIndex(m => m.id === id);

                // console.log(itemIndex);

                // this.messages[itemIndex].isRead = true;
                console.log(this.messages.findIndex(m => m.id === id));

                this.messages.splice(
                  this.messages.findIndex(m => m.id === id),
                  1
                );

                this.alertify.success('Message has been marked');
      },
      error => {
        this.alertify.error('Failed to mark the message');
      }

    );
  }
    );
  }


pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadMessages();
  }
}
