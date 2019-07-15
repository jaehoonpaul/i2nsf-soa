from apscheduler.jobstores.base import JobLookupError
from apscheduler.schedulers.background import BackgroundScheduler
import logging

logger = logging.getLogger("myapp.myLogger")


class Scheduler:
    job_list = []

    def __init__(self):
        self.bg_scheduler = BackgroundScheduler()
        self.bg_scheduler.start()
        self.job_id = ''

    def __del__(self):
        self.shutdown()

    def shutdown(self):
        self.bg_scheduler.shutdown()

    def kill_scheduler(self, job_id):
        try:
            self.bg_scheduler.remove_job(job_id)
        except JobLookupError as err:
            logger.error("fail to stop Scheduler: {}".format(err))
            return

    def scheduler(self, func, trigger, args=None, kwargs=None, job_id=None, name=None, **trigger_args):
        logger.debug("[{}:{}] Start: {}".format(trigger, job_id, trigger_args))
        if job_id:
            Scheduler.job_list.append(job_id)
        self.bg_scheduler.add_job(func, trigger, args, kwargs, id=job_id, name=name, **trigger_args)

    def schedule_cron(self, func, job_id=None, **trigger_args):
        """

        :param func:
        :param job_id:
        :param trigger_args: {
            year: 1970-9999
            month: 1-12
            day: 1-31
            week: 1-53
            day_of_week: 0-6 or mon,tue,wed,thu,fri,sat,sun
            hour: 0-23
            minute: 0-59
            second: 0-59
            start_date (datetime|str): earliest possible date/time to trigger on (inclusive)
            end_date (datetime|str): latest possible date/time to trigger on (inclusive)
            timezone (datetime.tzinfo|str): time zone to use for the date/time calculations (defaults to scheduler timezone)
        }
        :return:
        """
        self.scheduler(func, "cron", id=job_id, args=("cron", job_id), **trigger_args)

    def schedule_date(self, func, job_id=None, **trigger_args):
        """

        :param func:
        :param job_id:
        :param trigger_args:{
            run_date (datetime|str): the date/time to run the job at
            timezone (datetime.tzinfo|str): time zone for run_date if it doesn't have one already
        }
        :return:
        """
        self.scheduler(func, "date", id=job_id, **trigger_args)

    def schedule_interval(self, func, job_id=None, **trigger_args):
        """

        :param func:
        :param job_id:
        :param trigger_args: {
            weeks: weeks to wait
            days: days to wait
            hours: hours to wait
            minutes: minutes to wait
            seconds: seconds to wait
            start_date (datetime|str): starting point for the interval calculation
            end_date (datetime|str): latest possible date/time to trigger on
            timezone (datetime.tzinfo|str): time zone to use for the date/time calculations
        }
        :return:
        """
        self.bg_scheduler.add_job(func, "interval", id=job_id, **trigger_args)

    def set_interval(self, func, seconds, job_id=None):
        """

        :param func:
        :param seconds:
        :param job_id:
        :return:
        """
        self.schedule_interval(func, job_id, seconds=seconds)