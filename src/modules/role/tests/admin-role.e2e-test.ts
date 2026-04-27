import { UserTypeEnum } from "@prisma/client";
import { E2ETestSetup } from "@base/test/e2e-test-setup";
import { RoleSearch } from "../role.search";
import { BaseSearch } from "@src/base/search/base.search";
import { runE2ETests } from "@src/base/test/test-runner.helper";

class AdminRoleE2ETest extends E2ETestSetup
{
  userId: string = '00000000-0000-0000-0000-000000000001';
  routePath = '/admin/user/role';
  protected search: BaseSearch = new RoleSearch();

  private dto = {
    name: 'test_admin',
    type: UserTypeEnum.admin,
    description: 'test description',
    company_id: null,
    permissions: ['admin.user.index', 'admin.user.create']
  }

  async test_index(){
    const response = await this.sendRequest({
      method: 'get',
      url: '',
      query: {
        includes: this.search.relations,
        filter: {
          search: 'test',
          name: 'test',
          type: ['director', 'admin']
        },
        deleted: 'false'
      }
    });
    this.assertSuccess(response, 200);
  }

  async test_show(){
    const response = await this.sendRequest({
      method: 'get',
      url: '/1',      
    });
    this.assertSuccess(response, 200);
  }

  async test_store() {
    const response = await this.sendRequest({
      method: 'post',
      url: '',
      data: this.dto,
    });
    this.assertSuccess(response, 201);
  }

  async test_update() {
    const role = await this.prisma.role.findFirst({where:{name: 'test_admin'}});
    const response = await this.sendRequest({
      method: 'put',
      url: `/${role?.id}`,
      data: {
        name: 'test_admin',
        type: UserTypeEnum.director,
        description: 'test description',
        company_id: null,
        permissions: ['admin.user.index',]
      },
    });

    this.assertSuccess(response, 200);
  }

  async test_delete() {
    const role = await this.prisma.role.findFirst({where:{name: 'test_admin'}});
    const response = await this.sendRequest({
      method: 'delete',
      url: `/${role?.id}`,      
    });

    this.assertSuccess(response, 200);
  }

  async test_restore() {
    const role = await this.prisma.role.findFirst({where: {is_deleted: true}});
    
    const response = await this.sendRequest({
      method: 'delete',
      url: `/${role?.id}/restore`,
    });
    this.assertSuccess(response, 200);
  }
}
runE2ETests(AdminRoleE2ETest);