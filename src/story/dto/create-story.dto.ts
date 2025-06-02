export class CreateStoryDto {
    access: StoryAccessType;
    content: string;
    tag: string[]; //#
}

/**PUBLIC: 모두 열람가능(단, 차단할 경우 열람불가)
 * PRIVATE: 친구(팔로워-팔로잉 관계 성립시 가능)
 * SECRET: 본인만 열람 가능
 */
export enum StoryAccessType { 'PUBLIC', 'PRIVATE', 'SECRET' }

export enum RelationshipType { 'FOLLOWING', 'FRIEND', 'BLOCKED' }