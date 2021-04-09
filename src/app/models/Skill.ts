import { Contact } from 'app/main/apps/contacts/contact.model';
import { FuseUtils } from '@fuse/utils';

export class Skill {
    id: number;
    title: string;
    description: string;
    users: Contact[];

    constructor(skill, description) {

        this.title = skill || '';
        this.description = description || '';
        this.users = [];
    }
}