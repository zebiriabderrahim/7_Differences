import { ApiProperty } from '@nestjs/swagger';

export class Message {
    @ApiProperty()
    title: string;
    @ApiProperty()
    body: string;
}
