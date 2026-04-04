// src/admin/admin.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private service: AdminService) {}

  @Get('stats') getDashboardStats() { return this.service.getDashboardStats(); }

  // Users
  @Get('users')
  getUsers(
    @Query('role') role?: string, @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) { return this.service.getUsers(role, status, search, page, limit); }

  @Patch('users/:id/approve') approveUser(@Param('id') id: string) { return this.service.approveUser(id); }
  @Patch('users/:id/reject') rejectUser(@Param('id') id: string, @Body('reason') reason?: string) { return this.service.rejectUser(id, reason); }
  @Patch('users/:id/toggle-active') toggleActive(@Param('id') id: string) { return this.service.toggleUserActive(id); }
  @Delete('users/:id') deleteUser(@Param('id') id: string) { return this.service.deleteUser(id); }

  // Payments
  @Get('payments')
  getPayments(
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) { return this.service.getPayments(status, page, limit); }

  @Patch('payments/:id/approve') approvePayment(@Param('id') id: string) { return this.service.approvePayment(id); }
  @Patch('payments/:id/reject') rejectPayment(@Param('id') id: string, @Body('reason') reason?: string) { return this.service.rejectPayment(id, reason); }
  @Patch('payments/:id/dates') updateDates(@Param('id') id: string, @Body() body: { startDate: string; endDate: string }) {
    return this.service.updateSubscriptionDates(id, body.startDate, body.endDate);
  }

  // Messages
  @Get('messages')
  getMessages(
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) { return this.service.getMessages(status, page, limit); }

  @Patch('messages/:id/read') markRead(@Param('id') id: string) { return this.service.markMessageRead(id); }
  @Delete('messages/:id') deleteMessage(@Param('id') id: string) { return this.service.deleteMessage(id); }

  // Plans
  @Get('plans') getPlans() { return this.service.getPlans(); }
  @Patch('plans/:id') updatePlan(@Param('id') id: string, @Body() body: any) { return this.service.updatePlan(id, body); }
}
